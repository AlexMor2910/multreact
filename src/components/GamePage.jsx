import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import "./GamePage.css";

export default function GamePage(props) {
    const navigate = useNavigate();

    const [grade, setGrade] = useState(0);
    const [gameCounter, setGameCounter] = useState(0);
    const [exerciseQuestion, setExerciseQuestion] = useState("");
    const [exerciseAnswers, setExerciseAnswers] = useState([]);
    const [flagAnswered, setFlagAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        props.setWrongQuestions([]);
    }, []);

    useEffect(() => {
        setExerciseQuestion(props.questions[0][0]);
        setExerciseAnswers([...props.questions[0].slice(1, 5)].sort(() => Math.random() - 0.5));
    }, []);

    useEffect(() => {
        console.log(props.wrongQuestions);
    }, [props.wrongQuestions]);

    const checkAnswer = (label) => {
        if (flagAnswered) return;
        const correctAnswer = props.questions[gameCounter][1];
        setSelectedAnswer(label);
        setFlagAnswered(true);

        if (label === correctAnswer) {
            setGrade((prev) => prev + 1);
        } else {
            const current = props.questions[gameCounter];
            props.setWrongQuestions((prev) => [...prev, [current[0], current[1]]]);
        }
    };

    const getAnswerClass = (label) => {
        const correctAnswer = props.questions[gameCounter][1];
        if (!flagAnswered) return "answerButton";
        if (label === correctAnswer) return "answerButton correct";
        if (label === selectedAnswer) return "answerButton incorrect";
        return "answerButton";
    };

    const nextQuestion = () => {
        if (gameCounter + 1 < props.questions.length) {
            const nextIndex = gameCounter + 1;
            setGameCounter(nextIndex);
            setFlagAnswered(false);
            setSelectedAnswer(null);
            setExerciseQuestion(props.questions[nextIndex][0]);
            setExerciseAnswers([...props.questions[nextIndex].slice(1, 5)].sort(() => Math.random() - 0.5));
        } else {
            navigate("/results", {state: {grade, totalQuestions: props.questions.length}});
        }
    };

    const omitQuestion = () => {
        const current = props.questions[gameCounter];
        props.setWrongQuestions((prev) => [...prev, [current[0], current[1]]]);
        nextQuestion();
    };

    const endGame = () => {
        if (window.confirm("Do you want to end the game?")) navigate("/");
    };

    return (
        <main className="gamePage">
            <section className="gameCard">
                <div className="divisorLabels">
                    <div className="labelPoints">
                        <span>Question: {gameCounter + 1}/{props.questions.length}</span>
                        <span>Points: {grade}/{props.questions.length}</span>
                    </div>
                </div>

                <div className="questionSection">
                    <p className="questionEyebrow">Choose one answer</p>
                    <h1 className="labelQuestion">{exerciseQuestion}</h1>
                    <div className="answersGrid">
                        {exerciseAnswers.map((label, index) => (
                            <button className={getAnswerClass(label)} key={`${label}-${index}`} onClick={() => checkAnswer(label)} disabled={flagAnswered}>{label}</button>
                        ))}
                    </div>
                </div>

                <div className="gameActions">
                    <button onClick={endGame} className="endGameButton">End game</button>
                    <button onClick={nextQuestion} disabled={!flagAnswered} className={`nextButton ${flagAnswered ? "active" : "inactive"}`}>Next</button>
                    <button onClick={omitQuestion} disabled={flagAnswered} className="endGameButton">Omit</button>
                </div>
            </section>
        </main>
    );
}