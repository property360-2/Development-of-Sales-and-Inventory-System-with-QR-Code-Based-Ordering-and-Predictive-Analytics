<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    use HasFactory;

    protected $table = 'menus'; // table name
    protected $primaryKey = 'menu_id'; // custom PK (not id)
    public $timestamps = true; // we have created_at, updated_at

    protected $fillable = [
        'name',
        'description',
        'price',
        'category',
        'availability_status',
        'product_details',
    ];
}
