import ScrollListFiles from "./ScrollListFiles.jsx";
import {useState} from "react";
import * as XLSX from "xlsx";
import {useNavigate} from "react-router-dom";
import "./StartPage.css";

export default function StartPage(props) {
    const navigate = useNavigate();
    const {excelNames, setExcelNames, excelLength, setExcelLength, buttonState, setButtonState, inputValues, setInputValues} = props;
    const [total, setTotal] = useState(0);
    const [flagTotal, setFlagTotal] = useState(false);

    function addWrongAnswers(rows, difficulty = 3) {
        if (rows.length <= difficulty) {
            throw new Error(`Each selected Excel file needs at least ${difficulty + 1} questions.`);
        }

        const offsets = [];

        while (offsets.length < difficulty) {
            const offset = Math.floor(Math.random() * (rows.length - 1)) + 1;

            if (!offsets.includes(offset)) {
                offsets.push(offset);
            }
        }

        return rows.map((row, index) => {
            const wrongAnswers = offsets.map(offset => rows[(index + offset) % rows.length][1]);

            return [row[0], row[1], ...wrongAnswers];
        });
    }

    function selectFromEachArray(files, buttonStates, inputNumber) {
        const selections = [];

        files.forEach((rows, i) => {
            if (!buttonStates[i]) return;

            const data = (rows || []).slice(1).map(row => row.slice(0, 2));

            if (data.length === 0) return;

            const preparedData = addWrongAnswers(data, 3);

            const wantRaw = Number(inputNumber[i] ?? 0);
            const want = wantRaw > 0 ? Math.min(wantRaw, preparedData.length) : preparedData.length;

            let picked;

            if (want === preparedData.length) {
                picked = preparedData;
            } else {
                const idx = Array.from({length: preparedData.length}, (_, k) => k);

                for (let j = idx.length - 1; j > 0; j--) {
                    const r = Math.floor(Math.random() * (j + 1));
                    [idx[j], idx[r]] = [idx[r], idx[j]];
                }

                picked = idx.slice(0, want).map(k => preparedData[k]);
            }

            selections.push(...picked);
        });

        for (let i = selections.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selections[i], selections[j]] = [selections[j], selections[i]];
        }

        return selections;
    }

    const handleFiles = async (event) => {
        const files = Array.from(event.target.files);
        if (!files.length) return;

        const loadedFiles = await Promise.all(files.map(file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const workbook = XLSX.read(e.target.result, {type: "array"});
                    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {header: 1});
                    resolve({name: file.name.replace(/\.[^/.]+$/, ""), rows});
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        })));

        props.setExcelFiles(loadedFiles.map(file => file.rows));
        setExcelNames(loadedFiles.map(file => file.name));
        setExcelLength(loadedFiles.map(file => Math.max(file.rows.length - 1, 0)));
        setButtonState(Array(loadedFiles.length).fill(false));
        setInputValues(Array(loadedFiles.length).fill(0));
        setTotal(0);
        setFlagTotal(false);
        event.target.value = "";
    };

    const handleInputChange = (index, value) => {
        setInputValues(prev => {
            const updated = [...prev];
            updated[index] = Number(value) || 0;
            return updated;
        });
    };

    const getSelectedTotal = () => inputValues.reduce((sum, val, i) => {
        if (!buttonState[i]) return sum;
        const desired = val && val > 0 ? Math.min(val, excelLength[i]) : excelLength[i];
        return sum + desired;
    }, 0);

    const calculateTotal = () => {
        setTotal(getSelectedTotal());
        setFlagTotal(true);
    };

    const buttonRestart = () => {
        setButtonState(Array(excelNames.length).fill(false));
        setInputValues(Array(excelNames.length).fill(0));
        setFlagTotal(false);
    };

    const startGame = () => {
        const selectedTotal = getSelectedTotal();

        if (selectedTotal === 0) {
            alert("Please select at least one question.");
            return;
        }

        try {
            const selections = selectFromEachArray(props.excelFiles, buttonState, inputValues);
            props.setQuestions(selections);
            setTotal(selectedTotal);
            setFlagTotal(true);
            navigate("/game");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <main className="startPage">
            <section className="startCard">
                <header className="startHeader">
                    <p className="startEyebrow">Question setup</p>
                    <h1 className="labelNamePage">Multiple Answers Exercises</h1>
                    <p className="startDescription">Upload one or more Excel files, choose the files to include, and set the number of questions for your game.</p>
                </header>

                <div className="filePickerSection">
                    <input type="file" accept=".xls, .xlsx" onChange={handleFiles} multiple id="fileInput" />
                    <label htmlFor="fileInput" className="fileInputLabel" tabIndex="0">
                        {props.excelFiles.length > 0 ? "Select new files" : "Select files"}
                    </label>
                </div>

                {props.excelFiles.length > 0 && (
                    <div className="configurationPanel">
                        <div className="configurationToolbar">
                            <button onClick={buttonRestart} className="restartButton">Restart calculation</button>
                        </div>

                        <div className="fileTable">
                            <div className="fileTableHeader" aria-hidden="true">
                                <span>Filename</span>
                                <span>Questions</span>
                                <span>Desired</span>
                                <span>Include</span>
                            </div>
                            <ul className="fileTableList">
                                <ScrollListFiles listNames={excelNames} length={excelLength} buttonState={buttonState} setButtonState={setButtonState} inputValues={inputValues} onInputChange={handleInputChange} />
                            </ul>
                        </div>

                        <div className="totalSection">
                            <button onClick={calculateTotal} className="calculateTotalButton">Calculate total</button>
                            <span className="totalLabel">Total questions <strong className="totalValue">{flagTotal ? total : 0}</strong></span>
                        </div>

                        <button onClick={startGame} className="buttonStartGame">Start game</button>
                    </div>
                )}
            </section>
        </main>
    );
}