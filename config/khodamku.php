<?php

/**
 * Aturan bisnis peminjaman (pemanggilan) khodam.
 */
return [

    // Jumlah khodam aktif maksimal yang boleh dipegang satu pengamal
    'maksimal_aktif' => 2,

    // Lama kontrak pemanggilan sebelum jatuh tempo
    'durasi_hari' => 5,

    // Mahar denda per hari keterlambatan (rupiah)
    'tarif_denda_per_hari' => 5000,

];
