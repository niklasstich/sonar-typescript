import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { CreateSceneClass } from "../createScene";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { KeyboardEventTypes, UniversalCamera } from "@babylonjs/core";

// required imports
import "@babylonjs/loaders/glTF";

// digital assets
import roomModel from "../../assets/glb/2101_Assets_Unity_Prototype.glb";
import { MoodleApi } from "../externals/moodleAPI";

// Moodle Imports
import CourseTypes from "../externals/Types/course";
import QuizTypes from "../externals/Types/quiz";
import AttemptTypes from "../externals/Types/attempts";

const API = MoodleApi.getInstance();

let courses: CourseTypes.search_courses.response;
let quizzes: QuizTypes.get_quizzes_by_courses.response;
let attemptData: AttemptTypes.get_attempt_data.response;

let quizId: number;
let attemptId: number;

export class LukasScene implements CreateSceneClass {
    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        // Creates a Universal Camera and sets its position
        const camera = new UniversalCamera(
            "UniversalCamera",
            new Vector3(0, 3, 0),
            scene
        );

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        // We dont need the return value, but i want to show, how to access the light
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        // Test

        // import the mesh, we need to await it bevore we can use it
        const importResult = await SceneLoader.ImportMeshAsync(
            "",
            "",
            roomModel,
            scene,
            undefined,
            ".glb"
        );

        // set the scale of the Room
        importResult.meshes[0].scaling.scaleInPlace(10);

        // load API token
        await API.loadToken();

        courses = await API.getCourses("AutorentoolCourse");
        quizzes = await API.getQuizzesForCourse(courses.courses[0].id);
        quizId = quizzes.quizzes[0].id;

        this.setupNewAttempt();

        let keyblock = false;

        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    if (!keyblock) {
                        if (kbInfo.event.key === "1") {
                            this.checkInput(true);
                        }
                        if (kbInfo.event.key === "2") {
                            this.checkInput(false);
                        }
                        keyblock = true;
                    }
                    keyblock = true;
                    break;
                case KeyboardEventTypes.KEYUP:
                    keyblock = false;
                    break;
            }
        });

        return scene;
    };

    setupNewAttempt = async (): Promise<void> => {
        const attemptsInProgress = await API.getUserAttemptsForQuiz(quizId);
        if (attemptsInProgress.attempts.length === 0) {
            const startedAttempt = await API.startNewAttempt(quizId);
            attemptId = startedAttempt.attempt.id;
        } else {
            attemptId = attemptsInProgress.attempts[0].id;
        }

        attemptData = await API.getAttemptData(attemptId);

        // Construct dummy DOM to get Elements out of generated HTML
        const el = document.createElement("html");
        el.innerHTML = attemptData.questions[0].html;

        // This is extremly ugly, but it works. We need to find another solution for the real deal.
        const questions = el.getElementsByClassName("flex-fill ml-1");
        console.log(questions);
    };

    checkInput = async (answer: boolean): Promise<void> => {
        const resp = await API.processAttempt(attemptId, true, answer, 1);
        const test = await API.reviewAttempt(attemptId);

        if (test.questions[0].status === "Correct") {
            // Türe öffenen
            console.log("Richtig!");
        } else {
            console.log("Falsch!");
        }

        await this.setupNewAttempt();
    };
}

export default new LukasScene();
