import { format, createLogger, transports} from 'winston';
import path from 'path';
import env from './env';
import { format as dateFormat } from 'date-fns';
const { combine, timestamp, label, printf } = format;

const APP_NAME = env.APP_NAME || 'app';

export default function createLoggerInstance(filename:string){
	
	const fname = "/" + path.basename(path.dirname(filename)) + "/" + path.basename(filename); // get filename from path


	const fileRotateTransport = new transports.File({
		dirname:'./log',
		filename: `date-${dateFormat(new Date(), 'dd-MM-yyyy')}.log`,
	})

	//Using the printf format.
	const customFormat = printf(({ level, message, label, timestamp, stack }) => {
		return `${timestamp} [${fname}] [${label}] ${level}: ${message} ${(stack)?stack:''}`;   
	});

	const colors = {
		error: 'red',
		warn: 'yellow',
		info: 'cyan',
		debug: 'green'
	};

	const logger = createLogger({
		level: "debug",
		format: combine(label({ label: APP_NAME }),format.splat(),format.errors({stack:true}),timestamp({format: "MMM-DD-YYYY HH:mm:ss"}), customFormat),
		transports: [
			new transports.Console({format:combine(label({ label: APP_NAME }),format.colorize({colors:colors,message:true,level:true}),timestamp({format: "MMM-DD-YYYY HH:mm:ss"}), customFormat)}),
			fileRotateTransport,
		],
	});
	return logger;
};



