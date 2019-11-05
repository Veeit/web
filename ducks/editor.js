import {errorArray} from "~/lib/utils/error";

const initialState = {
    open: false,
    editorValue: "",
    editorDueAt: null,
    editorDone: true,
    editorInProgress: false,
    editorAttachment: null,
    creatingMilestone: false,
    creatingDiscussion: false,
    queue: [],
    isCreating: false,
    createFailed: false,
    errorMessages: null,
    fieldErrors: null
};

export const types = {
    TOGGLE_EDITOR: "TOGGLE_EDITOR",
    SET_EDITOR_VALUE: "SET_EDITOR_VALUE",
    SET_EDITOR_ATTACHMENT: "SET_EDITOR_ATTACHMENT",
    TOGGLE_EDITOR_DONE: "TOGGLE_EDITOR_DONE",
    EDITOR_MARK_DONE: "EDITOR_MARK_DONE",
    EDITOR_MARK_IN_PROGRESS: "EDITOR_MARK_IN_PROGRESS",
    EDITOR_MARK_REMAINING: "EDITOR_MARK_REMAINING",
    ADD_TO_QUEUE: "ADD_TO_QUEUE",
    REMOVE_FROM_QUEUE: "REMOVE_FROM_QUEUE",
    TASK_CREATE_REQUEST: "TASK_CREATE_REQUEST",
    TASK_CREATE_SUCCEED: "TASK_CREATE_SUCCEED",
    TASK_CREATE_FAILED: "TASK_CREATE_FAILED",
    EDITOR_TOGGLE_MILESTONE: "EDITOR_TOGGLE_MILESTONE",
    EDITOR_OPEN_DISCUSSIONS: "EDITOR_OPEN_DISCUSSIONS",
    EDITOR_TOGGLE_DISCUSSIONS: "EDITOR_TOGGLE_DISCUSSIONS",
    EDITOR_SET_DUE_AT: "EDITOR_SET_DUE_AT"
};

export const editorReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.TOGGLE_EDITOR:
            return {
                ...state,
                open: !state.open,
                creatingMilestone: false,
                creatingDiscussion: false
            };

        case types.EDITOR_TOGGLE_MILESTONE:
            return {
                ...state,
                creatingMilestone: !state.creatingMilestone
            };

        case types.EDITOR_TOGGLE_DISCUSSIONS:
            return {
                ...state,
                creatingDiscussion: !state.creatingDiscussion
            };

        case types.EDITOR_OPEN_DISCUSSIONS:
            return {
                ...state,
                open: true,
                creatingDiscussion: true
            };

        case types.ADD_TO_QUEUE:
            let task = {
                content: state.editorValue,
                done: state.editorDone,
                in_progress: state.editorInProgress,
                due_at: state.editorDueAt
            };
            if (state.editorAttachment) {
                task["attachment"] = state.editorAttachment;
            }
            return {
                ...state,
                editorValue: "",
                editorDueAt: null,
                editorDone: true,
                editorInProgress: false,
                editorAttachment: null,
                queue: [...state.queue, task]
            };

        case types.REMOVE_FROM_QUEUE:
            return {
                ...state,
                queue: [...state.queue].filter(
                    t => t.content !== action.task.content
                )
            };

        case types.SET_EDITOR_ATTACHMENT:
            return {
                ...state,
                editorAttachment: action.attachment
            };

        case types.EDITOR_SET_DUE_AT:
            return {
                ...state,
                editorDueAt: action.editorDueAt
            };

        case types.TASK_CREATE_REQUEST:
            return {
                ...state,
                isCreating: true,
                createFailed: false
            };

        case types.TASK_CREATE_SUCCEED:
            return {
                ...state,
                isCreating: false,
                expanded: false,
                open: false,
                queue: [],
                editorValue: "",
                editorDone: true,
                editorInProgress: false,
                editorAttachment: null,
                createFailed: false
            };

        case types.TASK_CREATE_FAILED:
            return {
                ...state,
                isCreating: false,
                createFailed: true,
                errorMessages: action.errorMessages,
                fieldErrors: action.fieldErrors
            };

        case types.TOGGLE_EDITOR_DONE:
            return {
                ...state,
                editorDone: !state.editorDone
            };

        case types.EDITOR_MARK_DONE:
            return {
                ...state,
                editorDone: true,
                editorInProgress: false
            };

        case types.EDITOR_MARK_IN_PROGRESS:
            return {
                ...state,
                editorDone: false,
                editorInProgress: true
            };

        case types.EDITOR_MARK_REMAINING:
            return {
                ...state,
                editorDone: false,
                editorInProgress: false
            };

        case types.SET_EDITOR_VALUE:
            return {
                ...state,
                editorValue: action.value
            };

        default:
            return state;
    }
};

export const actions = {
    toggleEditor: () => ({ type: types.TOGGLE_EDITOR }),

    addToQueue: () => ({ type: types.ADD_TO_QUEUE }),
    removeFromQueue: task => ({ type: types.REMOVE_FROM_QUEUE, task: task }),
    setEditorDueAt: value => ({
        type: types.EDITOR_SET_DUE_AT,
        editorDueAt: value
    }),
    setEditorValue: value => ({ type: types.SET_EDITOR_VALUE, value: value }),
    setEditorAttachment: attachment => ({
        type: types.SET_EDITOR_ATTACHMENT,
        attachment: attachment
    }),
    toggleEditorDone: () => ({ type: types.TOGGLE_EDITOR_DONE }),
    markDone: () => ({ type: types.EDITOR_MARK_DONE }),
    markInProgress: () => ({ type: types.EDITOR_MARK_IN_PROGRESS }),
    markRemaining: () => ({ type: types.EDITOR_MARK_REMAINING }),
    openMilestoneEditor: () => ({ type: types.EDITOR_TOGGLE_MILESTONE }),
    openDiscussionEditor: (toggle = true) => ({
        type: toggle
            ? types.EDITOR_TOGGLE_DISCUSSIONS
            : types.EDITOR_OPEN_DISCUSSIONS
    }),

    createTasks: () => {
        return {
            type: types.TASK_CREATE_REQUEST
        };
    },

    createSuccess: () => {
        return {
            type: types.TASK_CREATE_SUCCEED
        };
    },

    createFailed: (
        errorMessages = ["Creation failed."],
        fieldErrors = null
    ) => {
        return {
            type: types.TASK_CREATE_FAILED,
            errorMessages: errorArray(errorMessages),
            fieldErrors: fieldErrors ? fieldErrors : null
        };
    }
};