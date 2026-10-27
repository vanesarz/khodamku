<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Khodam extends Model
{
    protected $fillable = [
        'kode_khodam',
        'nama',
        'asal',
        'level_kekuatan',
        'deskripsi',
        'foto',
    ];

    public function kategoris(): BelongsToMany
    {
        return $this->belongsToMany(Kategori::class, 'kategori_khodam');
    }

    public function pemanggilans(): HasMany
    {
        return $this->hasMany(Pemanggilan::class);
    }
}
