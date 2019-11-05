import React from "react";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import processString from "react-process-string";
import ProjectLink from "../../components/ProjectLink";
import Fuse from "fuse.js";
import {Link} from "~/routes";
import {toDate} from "date-fns-tz";

const fuseOptions = {
    shouldSort: true,
    tokenize: true,
    matchAllTokens: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["content"]
};

function groupTasksByProject(tasks, orderByDate = false) {
    // Get all projects available.
    // accumulate all project sets
    // delete dupe projects
    let projects = {};

    let sortedTasks = tasks;

    if (orderByDate) {
        sortedTasks = orderBy([...tasks], task => new Date(task.done_at), [
            "desc"
        ]);
    }

    sortedTasks.map(task => {
        if (task.project_set.length !== 0) {
            task.project_set.map(project => {
                !(project.name in projects) && (projects[project.name] = []);
                projects[project.name].push(task);
                return null;
            });
        } else {
            !("Miscellaneous" in projects) && (projects["Miscellaneous"] = []);
            projects["Miscellaneous"].push(task);
            return null;
        }

        return null;
    });

    return projects;
}

export function groupTasksByProduct(tasks, products, orderByDate = false) {
    // Get all projects available.
    // accumulate all project sets
    // delete dupe projects
    let projects = {};

    let sortedTasks = tasks;

    if (orderByDate) {
        sortedTasks = orderBy([...tasks], task => new Date(task.done_at), [
            "desc"
        ]);
    }

    sortedTasks.map(task => {
        if (task.project_set.length !== 0) {
            task.project_set.map(project => {
                !(project.name in projects) && (projects[project.name] = []);
                projects[project.name].push(task);
                return null;
            });
        } else {
            !("Miscellaneous" in projects) && (projects["Miscellaneous"] = []);
            projects["Miscellaneous"].push(task);
            return null;
        }

        return null;
    });

    return projects;
}

function getProjectsFromTasks(tasks) {
    if (!tasks) return null;

    let projects = [];
    tasks.map(task => {
        projects.push(...task.project_set);
        return true;
    });

    return uniqBy(projects, "id");
}

function groupTasksByDone(tasks) {
    tasks = orderBy(tasks, "created_at", "desc");
    let resultObj = { done: [], in_progress: [], remaining: [] };
    let newObj = groupBy(tasks, task => {
        if (task.done) {
            return "done";
        } else if (task.in_progress) {
            return "in_progress";
        } else {
            return "remaining";
        }
    });

    return { ...resultObj, ...newObj };
}

function sortByDone(array) {
    return array.sort(item => item.done === false);
}

function orderByDate(data, order = "desc", tz = true) {
    let tzified = data;
    if (tz) {
        tzified = data.map(o => {
            o.created_at = toDate(o.created_at);
            return o;
        });
    }
    return orderBy(tzified, ["created_at"], [order]);
}

function orderByUpdated(data, order = "desc") {
    return orderBy(data, ["updated_at"], [order]);
}

function dateWithoutTime(date) {
    date.setHours(0, 0, 0, 0);
    return date;
}

function sortStreamByActivity(data) {
    if (data) {
        let orderedData = orderByDate(data, "desc", false);
        console.log(orderedData);
        // TODO: Order sortStreamByActivity by Date
        let groupedByDate = groupBy(orderedData, obj => {
            // this is the big deal here!
            let date = new Date(obj.created_at);
            return dateWithoutTime(new Date(date));
        });
        console.log(groupedByDate);
        let groupedByUser = {};
        Object.keys(groupedByDate).forEach(key => {
            groupedByUser[key] = groupBy(groupedByDate[key], obj => {
                if (typeof obj.user === "object") {
                    return `user-${obj.user.id}`;
                } else if (typeof obj.user === "number") {
                    return `user-${obj.user}`;
                }
            });
        });

        return groupedByUser;
    }
}

export function assignModelType(objects) {
    const sortedItems = [];
    Object.keys(objects).map(type => {
        objects[type].map(i =>
            sortedItems.push({
                type: type,
                ...i
            })
        );
    });
    return sortedItems;
}

function processTaskString(task) {
    const mentionsConfig = {
        regex: /(?:^|\s)(?:@)([a-zA-Z\d]+)/gm,
        fn: (key, result) => {
            const username = result[0];

            return (
                <Link
                    route="profile-page"
                    params={{ username: username.trim() }}
                >
                    <a>{username}</a>
                </Link>
            );
        }
    };

    // to get rid of whitespace span, just use regex:
    //         regex: /#(\w+)/g,
    const hashtagConfig = {
        regex: /(?:^|\s)(?:#)([a-zA-Z\d]+)/gm,
        fn: (key, result) => {
            if (!result[1]) return result[0];
            const projectName = result[1];
            let foundProjects = task.project_set.filter(
                project =>
                    project.name.toUpperCase() === projectName.toUpperCase()
            );

            if (!foundProjects.length) return result[0]; //#username

            return (
                <span>
                    {" "}
                    <ProjectLink project={foundProjects[0]} key={key}>
                        #{projectName}
                    </ProjectLink>
                </span>
            );
        }
    };

    return processString([mentionsConfig, hashtagConfig])(task.content);
}

function processMentions(string) {
    const mentionsConfig = {
        regex: /\B@[a-z0-9_-]+/gi,
        fn: (key, result) => {
            const username = result[0];

            return (
                <Link route="profile-page" params={{ username: username }}>
                    <a>{username}</a>
                </Link>
            );
        }
    };

    return processString([mentionsConfig])(string);
}

function applySearchTerms(tasks, searchTerms) {
    if (tasks) {
        let searchedTasks = tasks;
        if (searchTerms) {
            const fuse = new Fuse(tasks, fuseOptions);
            searchedTasks = fuse.search(searchTerms);
        }

        return searchedTasks;
    }

    return tasks;
}

function wasAddedToday(task) {
    return (
        new Date(task.created_at).toDateString() === new Date().toDateString()
    );
}

export function isDueSoon(task) {
    const today = new Date().getDate();
    const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    const taskDate = new Date(task.due_at);
    return (
        task.due_at && !task.done && (taskDate >= today && taskDate <= tomorrow)
    );
}

export {
    groupTasksByDone,
    groupTasksByProject,
    sortByDone,
    orderByDate,
    orderByUpdated,
    sortStreamByActivity,
    dateWithoutTime,
    applySearchTerms,
    wasAddedToday,
    getProjectsFromTasks,
    processTaskString,
    processMentions
};