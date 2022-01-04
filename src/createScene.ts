type Engine = import("@babylonjs/core/Engines/engine").Engine;
type Scene = import("@babylonjs/core/scene").Scene;

export interface CreateSceneClass {
    createScene: (engine: Engine, canvas: HTMLCanvasElement) => Promise<Scene>;
    preTasks?: Promise<unknown>[];
}

export interface CreateSceneModule {
    default: CreateSceneClass;
}

export const getSceneModuleWithName = (
    name?: string
): Promise<CreateSceneClass> => {
    return import("./scenes/lukasScene").then((module: CreateSceneModule) => {
        if (true) {
            return module.default;
        }
        return module.default;
    });
};

export const getSceneModule = (): Promise<CreateSceneClass> => {
    return import("./scenes/lukasScene").then((module: CreateSceneModule) => {
        const test = true;
        if (test) {
            return module.default;
        }
        return module.default;
    });
};
