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
        .take(1000)
        .collect();
    
    if values.is_empty() {
        return Err(format!("ファイル '{}' にデータがありません", filename).into());
    }
    
    Ok(values)
}

fn main() -> Result<(), Box<dyn Error>> {
    let values1 = file_to_values("wasm_frame_times.csv")?;
    let values2 = file_to_values("ts_frame_times.csv")?;
    
    // グラフの描画
    let root = BitMapBackend::new("plot_comparison.png", (800, 600)).into_drawing_area();
    root.fill(&WHITE)?;
    
    let max_x = values1.len().max(values2.len());
    let max_y1 = values1.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
    let min_y1 = values1.iter().cloned().fold(f64::INFINITY, f64::min);
    let max_y2 = values2.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
    let min_y2 = values2.iter().cloned().fold(f64::INFINITY, f64::min);
    
    let min_y = min_y1.min(min_y2);
    let max_y = max_y1.max(max_y2);
    
    let mut chart = ChartBuilder::on(&root)
        .caption("Frame Processing Time Comparison", ("Arial", 20).into_font())
        .margin(50)  // マージンを増やして凡例のスペースを確保
        .x_label_area_size(40)
        .y_label_area_size(40)
        .build_cartesian_2d(0..max_x, min_y..max_y)?;
    
    // メッシュ線を表示
    chart.configure_mesh().draw()?;
    
    // 1つ目のファイル（提案法）のデータを描画
    chart.draw_series(LineSeries::new(
        values1.iter().enumerate().map(|(i, &v)| (i, v)),
        &RED,
    ))?.label("Proposed method")
      .legend(|(x, y)| PathElement::new(vec![(x, y), (x + 20, y)], &RED));
    
    // 2つ目のファイル（従来法）のデータを描画
    chart.draw_series(LineSeries::new(
        values2.iter().enumerate().map(|(i, &v)| (i, v)),
        &BLUE,
    ))?.label("Conventional method")
    .legend(|(x, y)| PathElement::new(vec![(x, y), (x + 20, y)], &BLUE));
    
    // 凡例を追加
    chart
        .configure_series_labels()
        .background_style(&WHITE.mix(0.8))
        .border_style(&BLACK)
        .position(SeriesLabelPosition::UpperLeft)
        .draw()?;
    
    root.present()?;
    println!("plot_comparison.png にグラフを保存しました。");
    
    Ok(())
}