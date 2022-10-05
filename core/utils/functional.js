function isAsync(func){
    return func.constructor.name === 'AsyncFunction';
}

module.exports = { isAsync };


async function ff(){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('100%');
        }, 3000);   
    })
}

function test(){
    // let val = ff();
    // console.log(val);
    // let result = await val;
    // console.log(result);
    console.log(this)
}

// app.render(view, opts, done);

