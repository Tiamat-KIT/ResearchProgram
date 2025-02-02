import { useLayoutEffect } from 'react'
import init from "../graphics/wasm/rust_pentagram";
// import { useInView } from '../hooks/useInView';

function loadFrameTimesFromLocalStorage(): number[] {
    const key = "wasm_frame_times";
    const serialized = localStorage.getItem(key);
    if (serialized) {
        try {
            return JSON.parse(serialized) as number[];
        } catch (error) {
            console.error("ローカルストレージからのデータ解析に失敗しました", error);
        }
    }
    return [];
}

function downloadCSV(frameTimes: number[]): void {
    if (frameTimes.length === 0) {
        alert("保存されたフレームデータがありません。");
        return;
    }

    const csvContent = "data:text/csv;charset=utf-8," + frameTimes.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "frame_times.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function Wasm_View() {
    useLayoutEffect(() => {
        // statsというidを持つ要素を追加
        const statsEl = document.createElement("div")
        statsEl.id = "stats"

        // containerというidを持つ要素に対してstatsElを追加
        const containerEl = document.getElementById("container")
        containerEl?.appendChild(statsEl)

        // WebAssemblyの初期化
        init().then((wasm) => {
            console.log("Wasm initialized")
            wasm.run()
        })

         // CSVダウンロードボタンを作成
        const downloadButton = document.createElement("button");
        downloadButton.innerText = "CSVをダウンロード";
        downloadButton.addEventListener("click", () => {
            const frameTimes = loadFrameTimesFromLocalStorage();
            downloadCSV(frameTimes);
        });
        document.body.appendChild(downloadButton);

        // コンポーネントがアンマウントされた時にstatsElを削除
        return () => {
            containerEl?.removeChild(statsEl)
            document.body.removeChild(downloadButton);
            // ローカルストレージに保存されたフレームデータを削除
            localStorage.removeItem("wasm_frame_times");
        }
    }, [])

    return (
        <main>
            <section id="container">
                {/**WebAssemblyが描画する対象 */}
            </section>
        </main>
    )
}

export default Wasm_View

