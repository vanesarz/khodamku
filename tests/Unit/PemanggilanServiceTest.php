<?php

namespace Tests\Unit;

use App\Exceptions\KhodamSedangBersemayamException;
use App\Exceptions\KuotaRagaPenuhException;
use App\Models\Pemanggilan;
use App\Models\User;
use App\Repositories\Contracts\PemanggilanRepositoryInterface;
use App\Services\Denda\DendaHarian;
use App\Services\PemanggilanService;
use Carbon\Carbon;
use Mockery;
use Mockery\MockInterface;
use Tests\TestCase;

/**
 * Service diuji tanpa database: repository diganti stub Mockery.
 */
class PemanggilanServiceTest extends TestCase
{
    private PemanggilanRepositoryInterface&MockInterface $repository;

    private PemanggilanService $service;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-10-26 10:00:00');

        $this->repository = Mockery::mock(PemanggilanRepositoryInterface::class);
        $this->repository->allows('kunciUser');
        $this->repository->allows('kunciKhodam');

        $this->service = new PemanggilanService($this->repository, new DendaHarian);
        $this->user = (new User)->forceFill(['id' => 7]);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_pinjam_membuat_pemanggilan_dengan_jatuh_tempo_lima_hari(): void
    {
        $this->repository->allows('hitungAktifUser')->with(7)->andReturn(1);
        $this->repository->allows('khodamSedangAktif')->with(3)->andReturn(false);
        $this->repository->expects('buat')
            ->with([
                'user_id' => 7,
                'khodam_id' => 3,
                'tgl_panggil' => '2026-10-26',
                'tgl_jatuh_tempo' => '2026-10-31',
                'status' => 'aktif',
            ])
            ->andReturn(new Pemanggilan);

        $this->assertInstanceOf(Pemanggilan::class, $this->service->pinjam($this->user, 3));
    }

    public function test_pinjam_ditolak_saat_kuota_penuh(): void
    {
        $this->repository->allows('hitungAktifUser')->andReturn(2);
        $this->repository->shouldNotReceive('buat');

        $this->expectException(KuotaRagaPenuhException::class);
        $this->expectExceptionMessage('Raga Anda hanya kuat menampung maksimal 2 khodam aktif secara bersamaan.');

        $this->service->pinjam($this->user, 3);
    }

    public function test_pinjam_ditolak_saat_khodam_sedang_bersemayam(): void
    {
        $this->repository->allows('hitungAktifUser')->andReturn(0);
        $this->repository->allows('khodamSedangAktif')->andReturn(true);
        $this->repository->shouldNotReceive('buat');

        $this->expectException(KhodamSedangBersemayamException::class);

        $this->service->pinjam($this->user, 3);
    }

    public function test_lepas_terlambat_mencatat_mahar_denda(): void
    {
        $pemanggilan = (new Pemanggilan)->forceFill(['id' => 11, 'tgl_jatuh_tempo' => '2026-10-24']);

        $this->repository->allows('ambilAktifUntukDiubah')->with(11)->andReturn($pemanggilan);
        $this->repository->expects('lepas')
            ->withArgs(fn ($p, $tanggal, $mahar) => $p === $pemanggilan
                && $tanggal->toDateString() === '2026-10-26'
                && $mahar === 10000)
            ->andReturn($pemanggilan);

        $hasil = $this->service->lepas(11);

        $this->assertSame(2, $hasil['hari_terlambat']);
        $this->assertSame($pemanggilan, $hasil['pemanggilan']);
    }
}
