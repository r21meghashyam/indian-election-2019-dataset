const fetch = require('node-fetch');
const {JSDOM} = require('jsdom');
const fs = require('fs');
let Provinces=[];
let Votes=[];
let count = 0;
let _count =0;
const main=async()=>{
    const html = await (await fetch(`http://results.eci.gov.in/pc/en/constituencywise/ConstituencywiseU011.htm`)).text()
    const doc = new JSDOM(html).window.document
    
    doc.querySelectorAll("#ddlState option").forEach(option=>{
        if(!option.value.match(/^[SU]\d/))
            return;
        Provinces[option.value] = option.innerHTML
    })
    await Promise.all(Array.from(doc.querySelectorAll("input")).map(async input=>{
        
        if(input.id.match(/^[^SU]/))
            return
        const constituencies = input.value.split(";");
        constituencies.pop(); //remove empty element after ';'
        _count+=constituencies.length;
        return await Promise.all(constituencies.map(async constituency=>{
            const [constituency_id,constituency_name] = constituency.split(",");
            const trs = await Array.from(new JSDOM(await (await fetch(`http://results.eci.gov.in/pc/en/constituencywise/Constituencywise${input.id}${constituency_id}.htm?ac=${constituency_id}`)).text()).window.document.querySelectorAll(`table.table-party tr`)).slice(3);
            trs.pop();//remove total
            trs.forEach(tr=>{
                const [osn,candidate_name,party_name,evm_votes,postal_votes,total_votes,vote_share] =  Array.from(tr.children).map(elem=>elem.innerHTML);
                Votes.push({
                    province_name :Provinces[input.id] ,
                    constituency_name: constituency_name,
                    osn,
                    candidate_name,
                    party_name,
                    evm_votes,
                    postal_votes,
                    total_votes,
                    vote_share
                });
            });
            console.log(++count+'/'+_count);
            return true;
        }));
    }));
    fs.writeFileSync("votes.json",JSON.stringify(Votes,null,2));
    console.log("DONE");
    process.exit(0);
}
main();