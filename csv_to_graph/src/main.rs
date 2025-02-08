use std::error::Error;
use std::fs::File;
use std::io::{BufRead, BufReader};
use plotters::prelude::*;

fn file_to_values(filename: &str) -> Result<Vec<f64>, Box<dyn Error>> {
    let file = File::open(filename)?;
    let reader = BufReader::new(file);
    
    let values: Vec<f64> = reader
        .lines()
        .filter_map(|line| line.ok())
        .filter_map(|s| s.parse::<f64>().ok())
        .take(900)
        .collect();
    
    if values.is_empty() {
        return Err(format!("No data in file '{}'", filename).into());
    }
    
    Ok(values)
}

fn get_minimum_values(filenames: &[&str]) -> Result<Vec<f64>, Box<dyn Error>> {
    let mut all_values: Vec<Vec<f64>> = Vec::new();
    
    for &filename in filenames {
        let values = file_to_values(filename)?;
        all_values.push(values);
    }
    
    let mut min_values = vec![0.0; 900];
    for frame in 0..900 {
        let min: f64 = all_values.iter()
            .filter_map(|values| values.get(frame))
            .fold(f64::INFINITY, |a, &b| a.min(b));
        min_values[frame] = min;
    }
    
    Ok(min_values)
}

fn main() -> Result<(), Box<dyn Error>> {
    let font = "MS Gothic";
    let wasm_files = [
        "wasm_frame_times_1.csv",
        "wasm_frame_times_2.csv",
        "wasm_frame_times_3.csv"
    ];
    let ts_files = [
        "ts_frame_times_1.csv",
        "ts_frame_times_2.csv",
        "ts_frame_times_3.csv"
    ];
    let webgl_files = [
        "gl_frame_times_1.csv",
        "gl_frame_times_2.csv",
        "gl_frame_times_3.csv"
    ];
    
    let values1 = get_minimum_values(&wasm_files)?;
    let values2 = get_minimum_values(&ts_files)?;
    let values3 = get_minimum_values(&webgl_files)?;
    
    let root = BitMapBackend::new("plot_comparison.png", (1200, 800))
        .into_drawing_area();
    root.fill(&WHITE)?;
    
    let max_x = values1.len().max(values2.len()).max(values3.len());
    let max_y = values1.iter()
        .chain(values2.iter())
        .chain(values3.iter())
        .cloned()
        .fold(f64::NEG_INFINITY, f64::max);
    let min_y = values1.iter()
        .chain(values2.iter())
        .chain(values3.iter())
        .cloned()
        .fold(f64::INFINITY, f64::min);
    
    let mut chart = ChartBuilder::on(&root)
        .caption(
            "Frame Processing Time Comparison\n(Minimum values from three trials per implementation)",
            (font, 25).into_font(),
        )
        .margin(50)
        .x_label_area_size(50)
        .y_label_area_size(60)
        .build_cartesian_2d(0..max_x, min_y..max_y)?;
    
    chart.configure_mesh()
        .x_desc("Frame Number (count)")
        .y_desc("Processing Time (seconds)")
        .axis_desc_style((font, 20))
        .label_style((font, 15))
        .x_labels(15)
        .y_labels(10)
        .max_light_lines(4)
        .draw()?;
    
    chart.draw_series(LineSeries::new(
        values1.iter().enumerate().map(|(i, &v)| (i, v)),
        RED.mix(0.8).stroke_width(3),
    ))?.label("Proposed Method")
      .legend(|(x, y)| PathElement::new(vec![(x, y), (x + 20, y)], RED.mix(0.8).stroke_width(3)));

    chart.draw_series(LineSeries::new(
        values2.iter().enumerate().map(|(i, &v)| (i, v)),
        BLUE.mix(0.8).stroke_width(3),
    ))?.label("Conventional Method 2")
      .legend(|(x, y)| PathElement::new(vec![(x, y), (x + 20, y)], BLUE.mix(0.8).stroke_width(3)));
    
    chart.draw_series(LineSeries::new(
        values3.iter().enumerate().map(|(i, &v)| (i, v)),
        GREEN.mix(0.8).stroke_width(3),
    ))?.label("Conventional Method 1")
      .legend(|(x, y)| PathElement::new(vec![(x, y), (x + 20, y)], GREEN.mix(0.8).stroke_width(3)));
    
    chart
        .configure_series_labels()
        .background_style(&WHITE.mix(0.9))
        .border_style(&BLACK)
        .label_font((font, 20))
        .position(SeriesLabelPosition::UpperRight)
        .margin(15)
        .draw()?;
    
    root.present()?;
    println!("Plot has been saved to plot_comparison.png");
    
    Ok(())
}