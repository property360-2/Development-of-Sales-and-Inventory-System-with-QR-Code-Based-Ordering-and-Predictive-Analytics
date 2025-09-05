<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StoreMenuRequest;
use App\Http\Requests\Update\UpdateMenuRequest;

class MenuController extends Controller
{
    // List all menus
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20); // default 20 per page

        $menus = Menu::select(
            'menu_id',
            'name',
            'description',
            'price',
            'category',
            'availability_status',
            'product_details',
            'updated_at'
        )
            ->orderBy('menu_id', 'desc') // ✅ tamang paraan
            ->paginate($perPage);


        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed all menus (per_page=' . $perPage . ')',
            'timestamp' => now(),
        ]);

        return response()->json($menus);
    }


    // Show a single menu item
    public function show($id)
    {
        $menu = Menu::select('menu_id', 'name', 'description', 'price', 'category', 'availability_status', 'product_details')
            ->findOrFail($id);

        $userId = Auth::id();
        if (!$userId) {
            abort(403, 'Unauthorized');
        }

        AuditLog::create([
            'user_id' => $userId,
            'action' => 'Viewed Menu ID: ' . $menu->menu_id,
            'timestamp' => now(),
        ]);

        return response()->json($menu);
    }



    // Create a new menu
    public function store(StoreMenuRequest $request)
    {
        $menu = Menu::create($request->validated());
        return response()->json($menu, 201);
    }

    // Update a menu
    public function update(UpdateMenuRequest $request, $id)
    {
        $menu = Menu::findOrFail($id);
        $menu->fill($request->validated());

        $menu->save(); // triggers the updated event
        return response()->json($menu);
    }


    // Delete a menu
    public function destroy($id)
    {
        $menu = Menu::findOrFail($id);
        $menu->delete();
        return response()->json(null, 204);
    }
}
