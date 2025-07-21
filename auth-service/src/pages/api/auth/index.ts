import { Router } from "express";
import registerRouter from "./register";
import loginRouter from "./login";
import refreshRouter from "./refresh"; 
import logoutController from './logout'
import { getSessionController } from '../../../services/session.service';
import { authenticate } from '../../../middlewares/authenticate'; 

const router = Router();

router.use("/register", registerRouter);
router.use("/login", loginRouter);
router.use("/logout", logoutController);
router.use("/refresh", refreshRouter);  
router.get('/me', authenticate, getSessionController);

export default router;
