<?php

namespace App\Exceptions;

/**
 * Dilempar saat khodam yang diminta masih aktif di raga pengamal lain.
 */
class KhodamSedangBersemayamException extends PemanggilanDitolakException
{
    public function __construct()
    {
        parent::__construct('Khodam ini sedang bersemayam di raga pengamal lain.');
    }
}
