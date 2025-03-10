const rl = @import("raylib");
const std = @import("std");
const builtin = @import("builtin");
const emscripten = std.os.emscripten;

const WindowSize = struct {
    width: i32,
    height: i32,

    fn get() WindowSize {
        const display = rl.getCurrentMonitor();
        const width: i32 = @intFromFloat(@round(@as(f32, @floatFromInt(rl.getMonitorWidth(display))) * 0.8));
        const height: i32 = @intFromFloat(@round(@as(f32, @floatFromInt(rl.getMonitorHeight(display))) * 0.75));

        return WindowSize{ .width = width, .height = height };
    }
};

pub fn main() anyerror!void {
    const window_size = WindowSize.get();
    rl.initWindow(window_size.width, window_size.height, "raylib-zig [core] example - basic window");
    defer rl.closeWindow();

    switch (builtin.os.tag) {
        .emscripten => emscripten.emscripten_set_main_loop(&updateDrawFrame, 60, 1),
        else => {
            rl.setTargetFPS(60);
            while (!rl.windowShouldClose()) {
                updateDrawFrame();
            }
        },
    }
}

pub fn updateDrawFrame() callconv(.c) void {
    const window_size = WindowSize.get();
    rl.setWindowSize(window_size.width, window_size.height);

    rl.beginDrawing();
    defer rl.endDrawing();

    rl.clearBackground(rl.Color.blank);

    const text = "Work in progress, come back later!!";
    const text_offset = @divTrunc(rl.measureText(text, 20), 2);

    rl.drawText(text, @divTrunc(window_size.width, 2) - text_offset, @divTrunc(window_size.height, 2), 20, rl.Color.light_gray);
}
