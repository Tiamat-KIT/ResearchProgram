mod state;
mod instance;
mod vertex;
mod uniform;
mod env;

use std::result;

use state::WgpuState;

use winit::{
    event::*, event_loop::{self, EventLoop}, keyboard::{KeyCode, PhysicalKey}, platform::web::EventLoopExtWebSys, window::{self, WindowBuilder}
};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::wasm_bindgen;

#[cfg(target_arch = "wasm32")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

fn main() {
    pollster::block_on(run());  
}

#[cfg(target_arch = "wasm32")]
fn result_stats_exists() -> bool {
    let window = web_sys::window().unwrap().document().unwrap();
    let result_stats = window.get_element_by_id("stats");
    let result_stats = match result_stats {
        Some(result_stats) => true,
        None => {
            return false;
        }
    };
    result_stats
}

#[cfg_attr(all(target_arch = "wasm32", target_os = "unknown"), wasm_bindgen(start))]
async fn run() {
    
    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            std::panic::set_hook(Box::new(console_error_panic_hook::hook));
            // console_log::init_with_level(log::Level::Warn).expect("Couldn't initialize logger");
            wasm_logger::init(wasm_logger::Config::default());
        } else {
            env_logger::init();
        }
    }

    let event_loop = match EventLoop::new() {
        Ok(event_loop) => event_loop,
        Err(err) => {
            match err {
                winit::error::EventLoopError::NotSupported(not_supported_error) => {
                    log::error!("NotSupported: {not_supported_error}");
                    std::process::exit(1);
                },
                winit::error::EventLoopError::Os(os_error) => {
                    log::error!("Os: {os_error}");
                    std::process::exit(1);
                },
                winit::error::EventLoopError::AlreadyRunning => {
                    log::error!("AlreadyRunning");
                    std::process::exit(1);
                },
                winit::error::EventLoopError::RecreationAttempt => {
                    log::error!("RecreationAttempt");
                    std::process::exit(1);
                },
                winit::error::EventLoopError::ExitFailure(_) => {
                    log::error!("ExitFailure");
                    std::process::exit(1);
                },
            }
        }
    };
    
    let window = {
        cfg_if::cfg_if! {
            if #[cfg(target_arch = "wasm32")] {
                use winit::dpi::PhysicalSize;
                use winit::platform::web::{
                    WindowExtWebSys,
                };

                let window = WindowBuilder::new().build(&event_loop).unwrap();
                window.set_title("Pentagrams Web Window");
                
                web_sys::window()
                    .and_then(|win| win.document())
                    .and_then(|doc| {
                        let dst = doc.get_element_by_id("container")?;
                        let window_canvas = window.canvas().unwrap();
                        let canvas = web_sys::Element::from(window_canvas);
                        dst.append_child(&canvas).ok()?;
                        Some(())
                    })
                    .expect("Couldn't append canvas to document body.");

                let _ = window.request_inner_size(PhysicalSize::new(800, 800));
                window
            } else {
                WindowBuilder::new()
                    .with_title("Pentagrams Native Window")
                    .build(&event_loop)
                    .unwrap()
            }
        }
    };

    let mut state = WgpuState::new(window).await;
    let mut surface_configured = false;

    cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
            use winit::platform::web::EventLoopExtWebSys;
            event_loop.spawn(
                move |event,control_flow| {
                    match event {
                        Event::WindowEvent {
                            ref event,
                            window_id,
                        } if window_id == state.window.id() => {
                            if !state.input(event) {
                                match event {
                                    WindowEvent::CloseRequested
                                    | WindowEvent::KeyboardInput{
                                        event: KeyEvent {
                                            state: ElementState::Pressed,
                                            physical_key: PhysicalKey::Code(KeyCode::Escape),
                                            ..
                                        },
                                        ..
                                    } => {
                                        control_flow.exit()
                                    },
                                    WindowEvent::Resized(physical_size) => {
                                        log::info!("physical_size: {physical_size:?}");
                                        surface_configured = true;
                                        state.resize(*physical_size);
                                    }
                                    WindowEvent::RedrawRequested => {
                                        state.window.request_redraw();
    
                                        if (!surface_configured) {
                                            return;
                                        }

                                        if(!result_stats_exists()) {
                                            control_flow.exit();
                                        }
    
                                        state.update();
                                        match state.render() {
                                            Ok(_) => {}
                                            Err(wgpu::SurfaceError::Lost | wgpu::SurfaceError::Outdated) => state.resize(state.size),
                                            Err(wgpu::SurfaceError::OutOfMemory) => {
                                                log::error!("OutOfMemory");
                                                control_flow.exit();
                                            }
                                            Err(wgpu::SurfaceError::Timeout) => {
                                                log::warn!("Surface timeout")
                                            }
                                        }
                                    }
                                    _ => {}
                                }
                            }
                        }
                        _ => {}
                    }
                }
            )
        } else {
            event_loop
            .run(move |event, control_flow| {
                match event {
                    Event::WindowEvent {
                        ref event,
                        window_id,
                    } if window_id == state.window.id() => {
                        if !state.input(event) {
                            match event {
                                WindowEvent::CloseRequested
                                | WindowEvent::KeyboardInput {
                                    event: KeyEvent {
                                        state: ElementState::Pressed,
                                        physical_key: PhysicalKey::Code(KeyCode::Escape),
                                        ..
                                    },
                                    ..
                                } => control_flow.exit(),
                                WindowEvent::Resized(physical_size) => {
                                    log::info!("physical_size: {physical_size:?}");
                                    surface_configured = true;
                                    state.resize(*physical_size);
                                }
                                WindowEvent::RedrawRequested => {
                                    state.window.request_redraw();

                                    if (!surface_configured) {
                                        return;
                                    }

                                    if(!result_stats_exists()) {
                                        control_flow.exit();
                                    }
                                    
                                    state.update();
                                    match state.render() {
                                        Ok(_) => {}
                                        Err(wgpu::SurfaceError::Lost | wgpu::SurfaceError::Outdated) => state.resize(state.size),
                                        Err(wgpu::SurfaceError::OutOfMemory) => {
                                            log::error!("OutOfMemory");
                                            control_flow.exit();
                                        }
                                        Err(wgpu::SurfaceError::Timeout) => {
                                            log::warn!("Surface timeout")
                                        }
                                    }
                                }
                                _ => {}
                            }
                        }
                    }
                    _ => {}
                }
            })
            .unwrap();
        }
    }

}
