import { Router } from "express";

export const downloadRouter = Router();
downloadRouter.post('/download',(req, res) => {
    res.send('Download endpoint hit');
    //res.sendFile("/Users/gabrieladeraldo/Desktop/dev/envolve/conecta-social/src/presenter/html/templates/index.html");
})