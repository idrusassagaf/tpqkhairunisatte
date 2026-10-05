<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MasterHafalan extends Model
{
    use HasFactory;

    protected $table = 'master_hafalans';

    protected $guarded = [];

    public function progres()
    {
        return $this->hasMany(ProgresHafalan::class, 'master_hafalan_id');
    }
}
