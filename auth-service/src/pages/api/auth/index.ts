import { Router } from "express";
import registerRouter from "./register";
import loginRouter from "./login";
import refreshRouter from "./refresh"; 

const router = Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/refresh", refreshRouter);  

export default router;
