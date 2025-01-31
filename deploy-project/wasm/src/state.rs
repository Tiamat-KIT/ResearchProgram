use wgpu::util::DeviceExt;
use winit::{event::WindowEvent, window::Window};
use core::f64;
#[cfg(not(target_arch = "wasm32"))]
use std::time::Instant;

#[cfg(target_arch = "wasm32")]
use web_time::Instant;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use web_sys::{window, CanvasRenderingContext2d, HtmlCanvasElement};

use crate::env;

#[wasm_bindgen]
pub struct FrameStats {
    min_time: f64,
    max_time: f64,
    total_time: f64,
    frame_count: u64,
    frame_times: Vec<f64>,
}

#[wasm_bindgen]
impl FrameStats {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            min_time: f64::MAX,
            max_time: 0.0,
            total_time: 0.0,
            frame_count: 0,
            frame_times: Vec::new(),
        }
    }

    pub fn update(&mut self, frame_time: f64) {
        if frame_time < self.min_time {
            self.min_time = frame_time;
        }
        if frame_time > self.max_time {
            self.max_time = frame_time;
        }
        self.total_time += frame_time;
        self.frame_count += 1;
        self.frame_times.push(frame_time);
    }

    pub fn average_time(&self) -> f64 {
        if self.frame_count == 0 {
            0.0
        } else {
            self.total_time / self.frame_count as f64
        }
    }

    pub fn render_to_canvas(&self, canvas_id: &str) {
        let document = window().unwrap().document().unwrap();
        let canvas = document.get_element_by_id(canvas_id).unwrap();
        let canvas: HtmlCanvasElement = canvas.dyn_into::<HtmlCanvasElement>().unwrap();
        let context = canvas.get_context("2d").unwrap().unwrap();
        let context = context.dyn_into::<CanvasRenderingContext2d>().unwrap();

        let width = canvas.width() as f64;
        let height = canvas.height() as f64;
        context.clear_rect(0.0, 0.0, width, height);

        // 軸の描画
        context.set_stroke_style(&"black".into());
        context.begin_path();
        context.move_to(0.0, height);
        context.line_to(width, height);
        context.stroke();

        // フレーム時間データを折れ線グラフとして描画
        context.set_stroke_style(&"red".into());
        context.begin_path();

        if !self.frame_times.is_empty() {
            let max_time = self.max_time.max(16.0); // 最大 16ms（60FPS）でスケール
            let scale_x = width / self.frame_times.len() as f64;
            let scale_y = height / max_time;

            context.move_to(0.0, height - self.frame_times[0] * scale_y);
            for (i, &t) in self.frame_times.iter().enumerate() {
                let x = i as f64 * scale_x;
                let y = height - t * scale_y;
                context.line_to(x, y);
            }
        }
        context.stroke();
    }

    pub fn download_canvas_as_image(canvas_id: &str, filename: &str) {
        let document = window().unwrap().document().unwrap();
        let canvas = document.get_element_by_id(canvas_id).unwrap();
        let canvas: HtmlCanvasElement = canvas.dyn_into::<HtmlCanvasElement>().unwrap();

        let url = canvas.to_data_url().unwrap();
        let link = document.create_element("a").unwrap();
        link.set_attribute("href", &url).unwrap();
        link.set_attribute("download", filename).unwrap();
        
        let event = document.create_event("MouseEvents").unwrap();
        event.init_event("click");
        link.dispatch_event(&event).unwrap();
    }
}

pub struct WgpuState {
    pub instance: wgpu::Instance,
    pub surface: wgpu::Surface<'static>,
    pub device: Option<wgpu::Device>,
    pub queue: Option<wgpu::Queue>,
    pub config: Option<wgpu::SurfaceConfiguration>,
    pub size: winit::dpi::PhysicalSize<u32>,
    pub render_pipeline: Option<wgpu::RenderPipeline>,
    pub vertex_buffer: Option<wgpu::Buffer>,
    pub num_vertices: Option<u32>,
    pub index_buffer: Option<wgpu::Buffer>,
    pub num_indices: Option<u32>,
    pub uniform_buffer: Option<wgpu::Buffer>,
    pub uniform_bind_group: Option<wgpu::BindGroup>,
    pub instance_buffer: Option<wgpu::Buffer>,
    pub start_time: Option<Instant>,
    pub frame_stats: FrameStats,
    pub window: Window,
}

impl WgpuState {
    pub async fn new(window: Window) -> WgpuState {
        let size = window.inner_size();
        let instance = wgpu::Instance::new(wgpu::InstanceDescriptor {
            #[cfg(target_arch = "wasm32")]
            backends: wgpu::Backends::SECONDARY,
            #[cfg(not(target_arch = "wasm32"))]
            backends: wgpu::Backends::PRIMARY,
            ..Default::default()
        });
        let surface = unsafe{
            instance.create_surface_unsafe(
                wgpu::SurfaceTargetUnsafe::from_window(&window).unwrap()
            ).unwrap()
        };

        let adapter = instance
            .request_adapter(&wgpu::RequestAdapterOptions {
                power_preference: wgpu::PowerPreference::default(),
                compatible_surface: Some(&surface),
                force_fallback_adapter: false,
            })
            .await
            .unwrap();

        cfg_if::cfg_if! {
            if #[cfg(not(target_arch = "wasm32"))] {
                println!("Adapter: {:?}", adapter.get_info());
            } else {
                use wasm_bindgen::JsValue;
                web_sys::console::log_1(&JsValue::from_str(format!("Adapter: {:?}", adapter.get_info()).as_str()));
            }
        }
        let device_result = adapter
            .request_device(
                &wgpu::DeviceDescriptor {
                    label: None,
                    required_limits: wgpu::Limits::downlevel_webgl2_defaults(),
                    ..Default::default()
                },
                None,
            )
            .await;

        let (device, queue) = match device_result {
            Ok(result) => result,
            Err(err) => {
                panic!("Device error: {:?}", err);
            }
        };

        device.on_uncaptured_error(Box::new(|error| {
            panic!("Device error: {:?}", error);
        }));

        let surface_caps = surface.get_capabilities(&adapter);
        let config = wgpu::SurfaceConfiguration {
            usage: wgpu::TextureUsages::RENDER_ATTACHMENT,
            format: surface_caps.formats[0],
            width: size.width.max(1),
            height: size.height.max(1),
            present_mode: surface_caps.present_modes[0],
            alpha_mode: surface_caps.alpha_modes[0],
            view_formats: vec![],
            desired_maximum_frame_latency: 1,
        };
        surface.configure(&device, &config);

        let shader = device.create_shader_module(wgpu::ShaderModuleDescriptor {
            label: None,
            #[cfg(not(target_arch = "wasm32"))]
            source: wgpu::ShaderSource::Wgsl(include_str!("./shader.wgsl").into()),
            #[cfg(target_arch = "wasm32")]
            source: wgpu::ShaderSource::Wgsl(include_str!("./browser_shader.wgsl").into()),
        });

        let uniform_buffer = crate::uniform::Uniforms::get_uniform_buffer(&device);

        let (uniform_bind_group_layout, uniform_bind_group) =
            crate::uniform::Uniforms::get_uniform_bind_groups(&device, &uniform_buffer);

        let render_pipeline =
            crate::uniform::Uniforms::get_render_setting(&device, &uniform_bind_group_layout, &shader, &config);

        let (vertices, indices) = Self::create_star_vertices();
        let vertex_buffer = crate::vertex::Vertex::get_vertex_buffer(&device, &vertices);

        let index_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: None,
            contents: bytemuck::cast_slice(&indices),
            usage: wgpu::BufferUsages::INDEX,
        });

        let instances = crate::instance::create_star_instances();
        let instance_buffer = crate::instance::get_instance_buffer(&device, &instances);
        let mut stats = FrameStats::new();

        Self {
            instance,
            surface,
            device: Some(device),
            queue: Some(queue),
            config: Some(config),
            size,
            render_pipeline: Some(render_pipeline),
            vertex_buffer: Some(vertex_buffer),
            num_vertices: Some(vertices.len() as u32),
            index_buffer: Some(index_buffer),
            num_indices: Some(indices.len() as u32),
            uniform_buffer: Some(uniform_buffer),
            uniform_bind_group: Some(uniform_bind_group),
            instance_buffer: Some(instance_buffer),
            start_time: Some(Instant::now()),
            frame_stats: stats,
            window: window,
        }
    }

    pub fn native_new(window: Window) -> WgpuState {
        pollster::block_on(Self::new(window))
    }

    pub fn resize(&mut self, new_size: winit::dpi::PhysicalSize<u32>) {
        if new_size.width > 0 && new_size.height > 0 {
            self.size = new_size;
            if let Some(config) = &mut self.config {
                config.width = new_size.width;
                config.height = new_size.height;
            }
            self.surface.configure(&self.device.as_ref().unwrap(), &self.config.as_ref().unwrap());
        }
    }

    #[allow(unused_variables)]
    pub fn input(&mut self, event: &WindowEvent) -> bool {
        false
    }

    pub fn update(&mut self) {}

    fn create_star_vertices() -> (Vec<crate::vertex::Vertex>, Vec<u16>) {
        let num_points = 5;
        let vertices = crate::vertex::Vertex::get_vertices();

        let mut indices = Vec::new();

        for i in 0..num_points {
            let current = 1 + i;
            let next = 1 + ((i + 2) % num_points);

            indices.extend_from_slice(&[0, current as u16, next as u16]);
        }

        (vertices, indices)
    }

    pub fn render(&mut self) -> Result<(), wgpu::SurfaceError> {
        let render_before_time = Instant::now();
        let output = self.surface.get_current_texture().unwrap();
        let view = output.texture.create_view(&wgpu::TextureViewDescriptor::default());
    
        let now = Instant::now();
        let time = now.duration_since(self.start_time.clone().unwrap()).as_secs_f32();
        if let (
            Some(queue),
            Some(device),
            Some(uniform_buffer),
            Some(render_pipeline),
            Some(uniform_bind_group),
            Some(vertex_buffer),
            Some(index_buffer),
            Some(instance_buffer),
            Some(num_indices),
        ) = (
            &mut self.queue,
            &self.device,
            &self.uniform_buffer,
            &self.render_pipeline,
            &self.uniform_bind_group,
            &self.vertex_buffer,
            &self.index_buffer,
            &self.instance_buffer,
            self.num_indices,
        ) {
            queue.write_buffer(uniform_buffer, 0, bytemuck::cast_slice(&[crate::uniform::Uniforms::new(time)]));
            let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor { label: None });
    
            {
                let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
                    label: None,
                    color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                        view: &view,
                        resolve_target: None,
                        ops: wgpu::Operations {
                            load: wgpu::LoadOp::Clear(wgpu::Color::TRANSPARENT),
                            store: wgpu::StoreOp::Store,
                        },
                    })],
                    depth_stencil_attachment: None,
                    timestamp_writes: None,
                    occlusion_query_set: None,
                });
    
                render_pass.set_pipeline(render_pipeline);
                render_pass.set_bind_group(0, uniform_bind_group, &[]);
                render_pass.set_vertex_buffer(0, vertex_buffer.slice(..));
                render_pass.set_vertex_buffer(1, instance_buffer.slice(..));
                render_pass.set_index_buffer(index_buffer.slice(..), wgpu::IndexFormat::Uint16);
                render_pass.draw_indexed(0..num_indices, 0, 0..env::STAR_COUNT.parse::<u32>().expect("Failed to parse STAR_COUNT"));
            }
            queue.submit(std::iter::once(encoder.finish()));
        }
    
        output.present();
        let render_after_time = Instant::now();
        let render_time = render_after_time.duration_since(render_before_time).as_secs_f64();
        self.frame_stats.update(render_time);
    
        if self.frame_stats.frame_count % 60 == 0 {
            self.frame_stats.render_to_canvas("frameStatsCanvas");
        }
        
        Ok(())
    }
    
}