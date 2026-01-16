export class Observations{
    observation: string
    whoIsObservingId: string
    createdAt: Date
    updatedAt: Date
    constructor(observation: string, whoIsObservingId: string){
        this.observation = observation
        this.createdAt = new Date()
        this.updatedAt = new Date()
        this.whoIsObservingId = whoIsObservingId
    }
}