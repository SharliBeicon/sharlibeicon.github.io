const std = @import("std");
const emcc = @import("emcc.zig");

pub fn build(b: *std.Build) !void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const raylib_dep = b.dependency("raylib_zig", .{
        .target = target,
        .optimize = optimize,
    });

    const raylib = raylib_dep.module("raylib");
    const raylib_artifact = raylib_dep.artifact("raylib");

    if (target.query.os_tag == .emscripten) {
        const exe_lib = try emcc.compileForEmscripten(b, "live_timeline", "src/main.zig", target, optimize);

        exe_lib.linkLibrary(raylib_artifact);
        exe_lib.root_module.addImport("raylib", raylib);

        const link_step = try emcc.linkWithEmscripten(b, &[_]*std.Build.Step.Compile{ exe_lib, raylib_artifact });

        link_step.addArg("-s");
        link_step.addArg("ALLOW_MEMORY_GROWTH=1");
        link_step.addArg("-s");
        link_step.addArg("DISABLE_EXCEPTION_CATCHING=0");
        link_step.addArg("-s");
        link_step.addArg("NO_EXIT_RUNTIME=1");

        link_step.addArg("--embed-file");
        link_step.addArg("resources/");

        b.getInstallStep().dependOn(&link_step.step);
        const run_step = try emcc.emscriptenRunStep(b);
        run_step.step.dependOn(&link_step.step);
        const run_option = b.step("run", "Run live_timeline");
        run_option.dependOn(&run_step.step);
        return;
    }

    const exe = b.addExecutable(.{ .name = "live_timeline", .root_source_file = b.path("src/main.zig"), .optimize = optimize, .target = target });

    exe.linkLibrary(raylib_artifact);
    exe.root_module.addImport("raylib", raylib);

    const run_cmd = b.addRunArtifact(exe);
    const run_step = b.step("run", "Run live_timeline");
    run_step.dependOn(&run_cmd.step);

    b.installArtifact(exe);
}
