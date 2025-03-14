// raylib-zig (c) Nikolas Wipper 2020-2024

const std = @import("std");
const builtin = @import("builtin");

const emccOutputDir = "zig-out" ++ std.fs.path.sep_str ++ "htmlout" ++ std.fs.path.sep_str;
const emccOutputFile = "index.html";
pub fn emscriptenRunStep(b: *std.Build) !*std.Build.Step.Run {
    const emrunExe = switch (builtin.os.tag) {
        .windows => "emrun.bat",
        else => "emrun",
    };
    var emrun_run_arg = try b.allocator.alloc(u8, b.sysroot.?.len + emrunExe.len + 1);
    defer b.allocator.free(emrun_run_arg);

    if (b.sysroot == null) {
        emrun_run_arg = try std.fmt.bufPrint(emrun_run_arg, "{s}", .{emrunExe});
    } else {
        emrun_run_arg = try std.fmt.bufPrint(emrun_run_arg, "{s}" ++ std.fs.path.sep_str ++ "{s}", .{ b.sysroot.?, emrunExe });
    }

    const run_cmd = b.addSystemCommand(&[_][]const u8{ emrun_run_arg, emccOutputDir ++ emccOutputFile });
    return run_cmd;
}

pub fn compileForEmscripten(
    b: *std.Build,
    name: []const u8,
    root_source_file: []const u8,
    target: std.Build.ResolvedTarget,
    optimize: std.builtin.Mode,
) !*std.Build.Step.Compile {
    const lib = b.addStaticLibrary(.{
        .name = name,
        .root_source_file = b.path(root_source_file),
        .target = target,
        .optimize = optimize,
    });

    const emscripten_headers = try std.fs.path.join(b.allocator, &.{ b.sysroot.?, "cache", "sysroot", "include" });
    defer b.allocator.free(emscripten_headers);
    lib.addIncludePath(.{ .cwd_relative = emscripten_headers });
    return lib;
}

pub fn linkWithEmscripten(
    b: *std.Build,
    itemsToLink: []const *std.Build.Step.Compile,
) !*std.Build.Step.Run {
    const emccExe = switch (builtin.os.tag) {
        .windows => "emcc.bat",
        else => "emcc",
    };
    var emcc_run_arg = try b.allocator.alloc(u8, b.sysroot.?.len + emccExe.len + 1);
    defer b.allocator.free(emcc_run_arg);

    if (b.sysroot == null) {
        emcc_run_arg = try std.fmt.bufPrint(emcc_run_arg, "{s}", .{emccExe});
    } else {
        emcc_run_arg = try std.fmt.bufPrint(
            emcc_run_arg,
            "{s}" ++ std.fs.path.sep_str ++ "{s}",
            .{ b.sysroot.?, emccExe },
        );
    }

    const mkdir_command = switch (builtin.os.tag) {
        .windows => b.addSystemCommand(&.{ "cmd.exe", "/c", "if", "not", "exist", emccOutputDir, "mkdir", emccOutputDir }),
        else => b.addSystemCommand(&.{ "mkdir", "-p", emccOutputDir }),
    };

    const emcc_command = b.addSystemCommand(&[_][]const u8{emcc_run_arg});

    for (itemsToLink) |item| {
        emcc_command.addFileArg(item.getEmittedBin());
        emcc_command.step.dependOn(&item.step);
    }
    emcc_command.step.dependOn(&mkdir_command.step);
    emcc_command.addArgs(&[_][]const u8{
        "-o",
        emccOutputDir ++ emccOutputFile,
        "-sUSE_OFFSET_CONVERTER",
        "-sFULL-ES3=1",
        "-sUSE_GLFW=3",
        "-sASYNCIFY",
        "-O3",
    });
    return emcc_command;
}

fn lastIndexOf(string: []const u8, character: u8) usize {
    for (0..string.len) |i| {
        const index = string.len - i - 1;
        if (string[index] == character) return index;
    }
    return string.len - 1;
}
