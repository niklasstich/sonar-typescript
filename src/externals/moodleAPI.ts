// Wenn wir aus dem Prototypen raus sind, dann können wir uns evtl daran orientieren: https://github.dev/lukecarr/joodle

import axios from "axios";
import CourseTypes from "./Types/course";
import QuizTypes from "./Types/quiz";
import AttemptTypes from "./Types/attempts";

export class MoodleApi {
    private static instance: MoodleApi;

    public static getInstance(): MoodleApi {
        if (!MoodleApi.instance) {
            MoodleApi.instance = new MoodleApi();
        }
        return MoodleApi.instance;
    }

    public loadToken = async (): Promise<void> => {
        await this.getTokenFromApi().then((token) => {
            this.apiToken = token;
        });
    };

    private readonly baseUrl: string =
        "https://moodle.cluuub.xyz/webservice/rest/server.php?";

    private apiToken: string | undefined;

    private getTokenFromApi = async (): Promise<string | undefined> => {
        try {
            const { data } = await axios.get(
                "https://moodle.cluuub.xyz/login/token.php",
                {
                    params: {
                        username: "Philipp",
                        password: "zet_dzw5xcb-hpt_ZXW",
                        service: "moodle_mobile_app",
                    },
                }
            );

            if (!data.token) throw new Error();
            return data.token as string;
        } catch (error) {
            alert(
                "Mist, beim holen des Tokens ist was schief gelaufen! :(\n\n Vermutlich falsche Anmeldedaten..."
            );
            return;
        }
    };

    public getCourses = async (
        searchString: string
    ): Promise<CourseTypes.search_courses.response> => {
        const { data } = await axios.get<CourseTypes.search_courses.response>(
            this.baseUrl,
            {
                params: {
                    wstoken: this.apiToken,
                    moodlewsrestformat: "json",
                    wsfunction: "core_course_search_courses",
                    criterianame: "search",
                    criteriavalue: searchString,
                },
            }
        );

        return data;
    };

    public getQuizzesForCourse = async (
        courseId: number
    ): Promise<QuizTypes.get_quizzes_by_courses.response> => {
        const { data } =
            await axios.get<QuizTypes.get_quizzes_by_courses.response>(
                this.baseUrl,
                {
                    params: {
                        wstoken: this.apiToken,
                        moodlewsrestformat: "json",
                        wsfunction: "mod_quiz_get_quizzes_by_courses",
                        "courseids[]": courseId.toString(),
                    },
                }
            );

        return data;
    };

    public getUserAttemptsForQuiz = async (
        quizId: number
    ): Promise<AttemptTypes.get_user_attempts.response> => {
        const { data } =
            await axios.get<AttemptTypes.get_user_attempts.response>(
                this.baseUrl,
                {
                    params: {
                        wstoken: this.apiToken,
                        moodlewsrestformat: "json",
                        wsfunction: "mod_quiz_get_user_attempts",
                        quizid: quizId.toString(),
                        status: "unfinished",
                        includepreviews: "1",
                    },
                }
            );

        return data;
    };

    public getAttemptData = async (
        attemptId: number
    ): Promise<AttemptTypes.get_attempt_data.response> => {
        const { data } =
            await axios.get<AttemptTypes.get_attempt_data.response>(
                this.baseUrl,
                {
                    params: {
                        wstoken: this.apiToken,
                        moodlewsrestformat: "json",
                        wsfunction: "mod_quiz_get_attempt_data",
                        attemptid: attemptId.toString(),
                        page: "0",
                    },
                }
            );

        return data;
    };

    public startNewAttempt = async (
        quizId: number
    ): Promise<AttemptTypes.start_attempt.response> => {
        const { data } = await axios.get<AttemptTypes.start_attempt.response>(
            this.baseUrl,
            {
                params: {
                    wstoken: this.apiToken,
                    moodlewsrestformat: "json",
                    wsfunction: "mod_quiz_start_attempt",
                    quizid: quizId.toString(),
                },
            }
        );

        return data;
    };

    public processAttempt = async (
        attemptId: number,
        finishAttempt: boolean,
        trueOrFalse: boolean,
        sequenceCheck: number
    ): Promise<AttemptTypes.process_attempt.response> => {
        const qString = "q" + attemptId.toString() + ":1_";

        const { data } = await axios.get<AttemptTypes.process_attempt.response>(
            this.baseUrl,
            {
                params: {
                    wstoken: this.apiToken,
                    moodlewsrestformat: "json",
                    wsfunction: "mod_quiz_process_attempt",
                    attemptid: attemptId.toString(),
                    finishattempt: finishAttempt ? "1" : "0",

                    "data[0][name]": qString + "answer",
                    "data[0][value]": trueOrFalse ? "1" : "0",
                    "data[1][name]": qString + ":sequencecheck",
                    "data[1][value]": sequenceCheck.toString(),
                },
            }
        );

        return data;
    };

    public reviewAttempt = async (
        attemptId: number
    ): Promise<AttemptTypes.get_attempt_review.response> => {
        const { data } =
            await axios.get<AttemptTypes.get_attempt_review.response>(
                this.baseUrl,
                {
                    params: {
                        wstoken: this.apiToken,
                        moodlewsrestformat: "json",
                        wsfunction: "mod_quiz_get_attempt_review",
                        attemptid: attemptId.toString(),
                    },
                }
            );

        console.log(data.questions[0].status);

        return data;
    };
}
