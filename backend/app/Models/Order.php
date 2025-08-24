<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';
    protected $primaryKey = 'order_id';
    public $timestamps = true;

    protected $fillable = [
        'customer_id',
        'handled_by',
        'order_type',
        'status',
        'total_amount',
        'order_timestamp',
        'expiry_timestamp',
        'order_source',
    ];

    // Relationships
    public function customer() {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function user() {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function items() {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function payments() {
        return $this->hasMany(Payment::class, 'order_id');
    }
}
