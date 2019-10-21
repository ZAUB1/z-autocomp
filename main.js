const fs = require("fs");
const path = require("path");
const exec = require("child_process").spawn;
const ora = require("ora");

const CUR_DIR = "./";

class Compiler_c {
    constructor()
    {
        this.child;
        this.spinner;
    }

    CompileFolder(files)
    {
        this.spinner = ora("Compiling folder");

        this.child = exec("gcc", files, {
            silent: false,
            stdio: "inherit"
        });

        this.child.on("exit", code => {
            const ctime = new Date();
            const time = ctime.getHours() + ":" + ctime.getMinutes() + ":" + ctime.getSeconds();

            if (code == 1)
                return this.spinner.fail("[" + time + "] GCC Returned errors, check what's above");

            return this.spinner.succeed("[" + time + "] GCC Compiled successfully");
        });
    }
}

const Compiler = new Compiler_c;

const beingWatch = (compconf) => {
    const files = fs.readdirSync(CUR_DIR);
    var correct_files = [];

    correct_files.push(compconf.cflags);

    for (let i = 0; files[i]; i++)
    {
        const filename = path.join(CUR_DIR, files[i]);

        if (filename.includes(".c"))
        {
            correct_files.push(filename);

            fs.watchFile(correct_files[correct_files.length - 1], {interval: 500}, e => {
                Compiler.CompileFolder(correct_files);
            });
        }
    }
};

fs.readFile("./autoconf.json", (err, data) => {
    var compconf = "";

    if (!err)
        compconf = JSON.parse(data);

    beingWatch(compconf);
})