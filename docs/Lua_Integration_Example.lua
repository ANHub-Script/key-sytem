--[[
    WindUI - Auto Key System Integration
    Place this in your Script Loader
]]

local Player = game.Players.LocalPlayer
local HttpService = game:GetService("HttpService")
local RBXAnalyticsService = game:GetService("RbxAnalyticsService")

-- 1. Get HWID (Using ClientId as standard HWID for Executors)
local HWID = RBXAnalyticsService:GetClientId()

-- 2. Your GitHub Pages URL (CHANGE THIS!)
local WEBSITE_URL = "https://ANHub-Script.github.io/key-sytem/"

-- 3. Function to Check Key (Optional: Fetch raw keys.txt from GitHub)
local function checkKey(inputKey)
    -- Note: Raw GitHub URL might have caching delay (up to 5 mins)
    local success, response = pcall(function()
        return game:HttpGet("https://raw.githubusercontent.com/ANHub-Script/key-sytem/main/docs/keys.txt")
    end)
    
    if success then
        -- Simple check: Does "HWID KEY" exist in file?
        if string.find(response, HWID .. " " .. inputKey) then
            return true
        end
    end
    return false
end

-- 4. Open Website for User
local function getKey()
    -- Encode HWID to be URL safe
    local encodedHWID = HttpService:UrlEncode(HWID)
    local fullUrl = WEBSITE_URL .. "?hwid=" .. encodedHWID
    
    -- Copy Link to Clipboard (Backup)
    setclipboard(fullUrl)
    
    -- Notification
    game.StarterGui:SetCore("SendNotification", {
        Title = "WindUI Key System";
        Text = "Opening Key Page... (Link copied)";
        Duration = 5;
    })
    
    -- Open Browser (Standard Executor Function)
    if request then
        -- Most executors support opening URL via request or specialized function
        -- If not supported, user has clipboard
    end
    
    -- Try standard method
    local s, e = pcall(function()
        game:GetService("GuiService"):OpenBrowserWindow(fullUrl)
    end)
end

-- Example Usage
print("Your HWID:", HWID)
getKey() -- Opens the website with ?hwid=XYZ
