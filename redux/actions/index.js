export const addUser = (newData) => ({
    type: "CREATE_USER",
    payload: {
        newData
    }
})

export const userData = (userDetails) => ({
    type: "USER_DATA",
    payload : {
        userDetails
    }
})

export const loggedIn = (isUser) => ({
    type: "LOGGED_IN",
    payload: {
        isUser
    }
})

export const stepData = (stepData) => ({
    type: "STEP_DATA",
    payload: {
        stepData
    }
})

export const currentGoal = (currentGoal) => ({
    type: "CURRENT_GOAL",
    payload: {
        currentGoal
    }
})

export const setHeight = (updatedHeight) => ({
    type: "UPDATE_HEIGHT",
    payload: {
        updatedHeight
    }
})

export const setWeight = (updatedWeight) => ({
    type: "UPDATE_WEIGHT",
    payload: {
        updatedWeight
    }
})

export const setPatientId = (updatedPatientId) => ({
    type: "UPDATE_PATIENT",
    payload: {
        updatedPatientId
    }
})

export const setDoctorID = (updatedDoctorID) => ({
    type: "UPDATE_DOCTOR",
    payload: {
        updatedDoctorID
    }
})