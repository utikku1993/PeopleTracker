

export default (state, action) => {
    switch (action.type){
        case "CREATE_USER": 
            return Object.assign({}, state, action.payload.newData); //better way 
        case "USER_DATA": 
            return Object.assign({}, state, action.payload.userDetails); //better way
        case "LOGGED_IN": 
            return {
                state,
                isUser: action.payload.isUser.isUser
            }
        case "STEP_DATA":
            return {
                ...state,
                stepData: action.payload.stepData
            }
        case "CURRENT_GOAL":
            return {
                ...state,
                currentGoal: action.payload.currentGoal
            }
        case "UPDATE_HEIGHT":
            return {
                ...state,
                height: action.payload.updatedHeight
            }
        case "UPDATE_WEIGHT":
            return {
                ...state,
                weight: action.payload.updatedWeight
            }
        case "UPDATE_PATIENT":
            return {
                ...state,
                patientId: action.payload.updatedPatientId
            }
        case "UPDATE_DOCTOR":
            return {
                ...state,
                doctorId: action.payload.updatedDoctorID
            }
        default:
            return state;
    }
}