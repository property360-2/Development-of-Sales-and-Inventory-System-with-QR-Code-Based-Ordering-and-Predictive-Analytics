<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;
use App\Http\Requests\Store\StoreMenuRequest;
use App\Http\Requests\Update\UpdateMenuRequest;

class MenuController extends Controller
{
    // List all menus
    // GET /menus
    // Retrieves all menu items from the database and returns them as JSON
    public function index()
    {
        $menus = Menu::all(); // Get all records from the 'menus' table
        return response()->json($menus); // Return the records as a JSON response
    }


    // Show a single menu item
    // GET /menus/{id}
    // Finds a menu item by its ID and returns it as JSON
    public function show($id)
    {
        $menu = Menu::findOrFail($id); // Find menu by ID or return 404 if not found
        return response()->json($menu);
    }


    // Create a new menu
    // POST /menus
    // Validates request data and creates a new menu item in the database
    public function store(StoreMenuRequest $request)
    {
        $menu = Menu::create($request->validated());
        return response()->json($menu, 201);
    }
    // Update a menu
    // PUT/PATCH /menus/{id}
    // Updates a menu item with the provided request data

    public function update(UpdateMenuRequest $request, $id)
    {
        $menu = Menu::findOrFail($id);
        $menu->update($request->validated());
        return response()->json($menu);
    }

    // Delete a menu
    // DELETE /menus/{id}
    // Deletes a menu item from the database
    public function destroy($id)
    {
        Menu::destroy($id); // Delete menu by ID
        return response()->json(null, 204); // Return HTTP 204 No Content
    }
}
