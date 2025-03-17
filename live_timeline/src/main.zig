const rl = @import("raylib");
const std = @import("std");
const builtin = @import("builtin");
const emscripten = std.os.emscripten;

const WindowSize = struct {
    width: i32,
    height: i32,

    fn get() WindowSize {
        const display = rl.getCurrentMonitor();
        const width: i32 = @intFromFloat(
            @round(@as(f32, @floatFromInt(rl.getMonitorWidth(display))) * 0.8),
        );
        const height: i32 = @intFromFloat(
            @round(@as(f32, @floatFromInt(rl.getMonitorHeight(display))) * 0.8),
        );

        return WindowSize{ .width = width, .height = height };
    }
};

pub fn main() anyerror!void {
    const window_size = WindowSize.get();
    rl.initWindow(window_size.width, window_size.height, "Charlie's Live Timeline");
    defer rl.closeWindow();

    const banner_img = try rl.loadImage("resources/banner.png");
    const banner = try rl.loadTextureFromImage(banner_img);
    defer rl.unloadTexture(banner);
    rl.unloadImage(banner_img);

    var loop_args = LoopArgs{
        .banner = banner,
    };

    switch (builtin.os.tag) {
        .emscripten => emscripten.emscripten_set_main_loop_arg(
            &updateDrawFrame,
            &loop_args,
            60,
            1,
        ),
        else => {
            rl.setConfigFlags(.{ .window_resizable = true });
            rl.setTargetFPS(60);
            while (!rl.windowShouldClose()) {
                updateDrawFrame(&loop_args);
            }
        },
    }
}

const LoopArgs = struct { banner: rl.Texture2D };

pub fn updateDrawFrame(args_ptr: ?*anyopaque) callconv(.c) void {
    const args: *const LoopArgs = @ptrCast(@alignCast(args_ptr orelse return));

    const window_size = WindowSize.get();
    if (builtin.os.tag == .emscripten) {
        rl.setWindowSize(window_size.width, window_size.height);
    }

    rl.beginDrawing();
    defer rl.endDrawing();

    rl.clearBackground(rl.Color.blank);

    const text = "Work in progress, come back later!!";
    const text_offset = @divTrunc(rl.measureText(text, 20), 2);

    const banner_x = @divTrunc(window_size.width, 2) - @divTrunc(args.banner.width, 2);
    const banner_y = @divTrunc(window_size.height, 2) - @divTrunc(args.banner.height, 2);

    rl.drawTexture(args.banner, banner_x, banner_y, rl.Color.white);
    rl.drawText(text, @divTrunc(window_size.width, 2) - text_offset, banner_y + args.banner.height, 20, rl.Color.light_gray);
}
