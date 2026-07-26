import './App.css'
import RouterComponent from './components/RouterComponent.jsx'
import {useState} from "react";

export default function App() {
    const [excelFiles, setExcelFiles] = useState([])
    const [questions, setQuestions] = useState([])
    const [wrongQuestions, setWrongQuestions] = useState([]);

    return (
        <>
            <RouterComponent excelFiles={excelFiles} setExcelFiles={setExcelFiles} questions={questions}
                             setQuestions={setQuestions} wrongQuestions={wrongQuestions}
                             setWrongQuestions={setWrongQuestions} />
        </>
    )
}
