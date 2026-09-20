import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const port=process.env.PORT||'57600';
const child=spawn('php',['-S',`127.0.0.1:${port}`,'-t',root+'public',root+'router.php'],{cwd:root,env:{...process.env,HUB_DEV:'1'},stdio:'inherit'});
child.on('exit',code=>process.exit(code||0));for(const sig of ['SIGINT','SIGTERM'])process.on(sig,()=>child.kill(sig));
