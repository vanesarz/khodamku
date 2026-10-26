<?php

namespace App\Support;

use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Pagination opsional untuk endpoint daftar.
 *
 * Tanpa parameter per_page, endpoint tetap mengembalikan seluruh data seperti
 * sebelumnya. Dengan per_page, data dipotong per halaman dan respons diberi "meta".
 */
class Halaman
{
    /** @var array<string, array<int, string>> */
    public const ATURAN = [
        'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        'page' => ['nullable', 'integer', 'min:1'],
    ];

    public static function dari(Builder $query, Request $request): ?LengthAwarePaginator
    {
        return $request->filled('per_page')
            ? $query->paginate($request->integer('per_page'))
            : null;
    }

    /**
     * @return array{current_page: int, per_page: int, total: int, last_page: int}
     */
    public static function meta(LengthAwarePaginator $halaman): array
    {
        return [
            'current_page' => $halaman->currentPage(),
            'per_page' => $halaman->perPage(),
            'total' => $halaman->total(),
            'last_page' => $halaman->lastPage(),
        ];
    }
}
