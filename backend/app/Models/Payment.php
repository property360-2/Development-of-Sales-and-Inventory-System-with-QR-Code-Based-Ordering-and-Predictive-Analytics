<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'payments';
    protected $primaryKey = 'payment_id';
    public $timestamps = true;

    protected $fillable = [
        'order_id',
        'amount_paid',
        'payment_method',
        'payment_status',
        'payment_timestamp',
    ];

    public function order() {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
