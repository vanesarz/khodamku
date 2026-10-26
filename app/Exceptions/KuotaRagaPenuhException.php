<?php

namespace App\Exceptions;

/**
 * Dilempar saat pengamal sudah memegang jumlah khodam aktif maksimal.
 */
class KuotaRagaPenuhException extends PemanggilanDitolakException
{
    public function __construct(int $maksimal)
    {
        parent::__construct("Raga Anda hanya kuat menampung maksimal {$maksimal} khodam aktif secara bersamaan.");
    }
}
