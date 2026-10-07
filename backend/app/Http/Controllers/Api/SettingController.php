<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\DataSync;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show()
    {
        return response()->json(Setting::getAppSettings());
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'font' => 'nullable|in:dm-sans,outfit,system,serif',
            'theme' => 'nullable|in:light,dark',
            'palette' => 'nullable|in:forest,ocean,sunset,slate,berry',
            'currency' => 'nullable|in:CDF,USD',
            'usdRate' => 'nullable|integer|min:1',
        ]);

        $settings = Setting::saveAppSettings($data);
        DataSync::bump();

        return response()->json($settings);
    }
}
