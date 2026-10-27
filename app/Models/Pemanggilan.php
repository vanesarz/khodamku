<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pemanggilan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'khodam_id',
        'tgl_panggil',
        'tgl_jatuh_tempo',
        'tgl_pelepasan',
        'mahar',
        'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function khodam(): BelongsTo
    {
        return $this->belongsTo(Khodam::class);
    }
}
