<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $table = 'order_items';
    protected $primaryKey = 'order_item_id';
    public $timestamps = true;

    protected $fillable = [
        'order_id',
        'menu_id',
        'quantity',
        'price',
    ];

    public function order() {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function menu() {
        return $this->belongsTo(Menu::class, 'menu_id');
    }
}
