<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use Illuminate\Http\Request;

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

    // Create a new menu
    // POST /menus
    // Validates request data and creates a new menu item in the database
    public function store(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric',
            'category' => 'required|string|max:50',
            'availability_status' => 'required|boolean',
        ]);

        // Create the menu item with validated data
        $menu = Menu::create($request->all());
        return response()->json($menu, 201); // Return the created menu with HTTP status 201
    }

    // Show a single menu item
    // GET /menus/{id}
    // Finds a menu item by its ID and returns it as JSON
    public function show($id)
    {
        $menu = Menu::findOrFail($id); // Find menu by ID or return 404 if not found
        return response()->json($menu);
    }

    // Update a menu
    // PUT/PATCH /menus/{id}
    // Updates a menu item with the provided request data
    public function update(Request $request, $id)
    {
        $menu = Menu::findOrFail($id); // Find menu by ID or return 404 if not found

        // Validate incoming request data (fields are optional)
        $request->validate([
            'name' => 'sometimes|string|max:100',
            'price' => 'sometimes|numeric',
            'category' => 'sometimes|string|max:50',
            'availability_status' => 'sometimes|boolean',
        ]);

        $menu->update($request->all()); // Update the menu item with provided data
        return response()->json($menu); // Return updated menu item as JSON
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
