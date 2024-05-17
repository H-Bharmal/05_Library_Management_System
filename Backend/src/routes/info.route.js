import {Router} from 'express'
import {verifyJWTAdmin} from '../middlewares/auth.admin.middleware.js'
import { totalBooksInLibrary, totalStudentsRegistered, totalActiveIssues, totalFinePending, countStudentsWithFine, countBooksAlreadyDue } from '../controllers/info.controller.js';
import {middlewareDataAssembler} from "../utils/middlewareDataAssembler.js"

const informationRouter=  Router();

informationRouter.route('/countBooksInLibrary').get(verifyJWTAdmin, totalBooksInLibrary, middlewareDataAssembler);
informationRouter.route('/countStudentsRegistered').get(verifyJWTAdmin, totalStudentsRegistered, middlewareDataAssembler);
informationRouter.route('/countActiveIssues').get(verifyJWTAdmin, totalActiveIssues, middlewareDataAssembler);
informationRouter.route('/totalFinePending').get(verifyJWTAdmin, totalFinePending, middlewareDataAssembler);
informationRouter.route('/countStudentsWithFine').get(verifyJWTAdmin, countStudentsWithFine, middlewareDataAssembler);
informationRouter.route('/countBooksAlreadyDue').get(verifyJWTAdmin, countBooksAlreadyDue, middlewareDataAssembler);

informationRouter.route('/getCountInformationAll').get(verifyJWTAdmin, totalBooksInLibrary, totalStudentsRegistered, totalActiveIssues, totalFinePending, countStudentsWithFine, countBooksAlreadyDue, middlewareDataAssembler);
// informationRouter.route('/getCountInformationAll').get(verifyJWTAdmin, totalBooksInLibrary, totalStudentsRegistered);

export {informationRouter}