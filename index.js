const mongoose = require('mongoose');
const fetch = require('node-fetch');
const {JSDOM} = require('jsdom');
const fs = require('fs');


mongoose.connect('mongodb://localhost:27017/election', {useNewUrlParser: true});

const url = 'http://results.eci.gov.in/pc/en/constituencywise/ConstituencywiseU011.htm';

const Province = mongoose.model('Province', {
    province_name: String,
    province_id: String
    });

const Constituencies = mongoose.model('Constituencies', {
    province_name: String,
    province_id: String,
    constituency_name: String,
    constituency_id: Number
    });

const Votes = mongoose.model('Votes',{
    province_id: String,
    province_name: String,
    constituency_id: Number,
    constituency_name: String,
    type: String,
    candidate_name: String,
    osn: Number,
    party_name: String,
    evm_votes: Number,
    postal_votes: Number,
    total_votes: Number,
    vote_share: Number
})

const getConstituencies=async (dom)=>{
    const inputs = dom.window.document.querySelectorAll("input");
    return Promise.all(Array.from(inputs).map(async i=>{
        if(i.id.match(/^[^SU]/))
            return;
        const province_id = i.id;
        const {province_name} = await Province.findOne({province_id});
        console.log(province_name);
        const constituency_string = i.value;
        const constituencies = constituency_string.split(";");
        constituencies.pop(); //remove empty element after ';'
        constituencies.forEach(async constituency=>{
            const [constituency_id,constituency_name] = constituency.split(",");
            const doc = new Constituencies({
                province_id,
                province_name,
                constituency_name,
                constituency_id
            });
            await doc.save();
            console.log(doc);
        }) 
    }));
}

const getProvinces=async (dom)=>{
    const options = dom.window.document.querySelector("#ddlState").querySelectorAll("option");
    return Promise.all(Array.from(options).map(async option=>{
        if(!option.value.match(/^[SU]\d/))
            return;
        const province_id = option.value;
        const province_name = option.innerHTML;
        const doc = new Province({
            province_id,
            province_name
        });
        await doc.save();
        console.log(doc);
    }));
}

const getAllVotes=async()=>{
    const constituencies = await Constituencies.find();
    return Promise.all(constituencies.map(async constituency=>{
        const {province_id,province_name,constituency_id,constituency_name} = constituency;
        const type = province_id.startsWith("S")?"State":"Union Territory";
    
        const response = await fetch(`http://results.eci.gov.in/pc/en/constituencywise/Constituencywise${province_id}${constituency_id}.htm?ac=${constituency_id}`);
        const html = await response.text();
        const dom = new JSDOM(html);
        const table = dom.window.document.querySelector(`table.table-party`);
        const trs = Array.from(table.querySelectorAll('tr')).slice(3);
        trs.pop();//remove total
        await Promise.all(Array.from(trs).map(async tr=>{
            const [osn,candidate_name,party_name,evm_votes,postal_votes,total_votes,vote_share] =  Array.from(tr.children).map(elem=>elem.innerHTML);
            const doc = new Votes({
                province_id,
                province_name,
                constituency_id,
                constituency_name,
                type,
                osn,
                candidate_name,
                party_name,
                evm_votes,
                postal_votes,
                total_votes,
                vote_share
            });
            await doc.save();
            console.log(doc);
            
        }));
    }));

}
const createJSON=async () =>{
    const provinces = await Province.find();
    await fs.writeFileSync("provinces.json",JSON.stringify(provinces,null,2));
    const constituencies = await Constituencies.find();
    await fs.writeFileSync("constituencies.json",JSON.stringify(constituencies,null,2));
    const votes = await Votes.find();
    await fs.writeFileSync("votes.json",JSON.stringify(votes,null,2));
}

const main=async()=>{
    //Delete old data, avoiding duplicate entries
    await Promise.all([
        Province.deleteMany({}),
        Constituencies.deleteMany({}),
        Votes.deleteMany({})
    ]);

    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    await getProvinces(dom);
    await getConstituencies(dom);
    await getAllVotes();
    await createJSON();
    console.log("DONE");
    process.exit(0);
}

main();
