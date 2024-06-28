
sirAlphaNum="";
v_intervale=[[48,57],[65,90],[97,122]]
for(let interval of v_intervale){
    for(let i=interval[0]; i<=interval[1]; i++)
        sirAlphaNum+=String.fromCharCode(i)//siralpha toate caract din token
}

console.log(sirAlphaNum);

function genereazaToken(n){
    let token=""
    for (let i=0;i<n; i++){
        token+=sirAlphaNum[Math.floor(Math.random()*sirAlphaNum.length)]//cel mai mare nr intreg <nr nostru si asa creeam un token aleator
    }
    return token;
}

module.exports.genereazaToken=genereazaToken;