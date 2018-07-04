var fnAsm = function() {
    out = "";
    var fname;
    while(fname = ENV.uses.shift()) {
        var fn = LIB[fname]
        if (!fn) throw new Error("Cannot link "+fname)

        if (fn.sysdb) {
            var sv;
            for(var i=0;i<fn.sysdb.length;i++){
                ENV.addVar(fn.sysdb[i],"sysdb")
            }
        }
        if (fn.sysdw) {
            var sv;
            for(var i=0;i<fn.sysdw.length;i++){
                ENV.addVar(fn.sysdw[i],"sysdw")
            }
        }
        out+=";---"+fname+"---\n"
        out+=fname+":\n"
        out += fn.code
        out+=";---"+fname+"-end---\n\n"
    }
    return out;

}


/// a big library

var LIB = {
    "printstr": {
        uses:["serout"],
        code: "\tMOV A,M\n"+
        "\tORA A\n"+
        "\tRZ\n"+
        "\tCALL serout\n"+
        "\tINX H\n"+
        "\tJMP printstr\n"
    },
    "printint": {
        uses:["s_div10","serout","f_abs"],
        code: ""+
        "\tMOV     a,h \n"+
        "\tORA     a \n"+
        "\tJP      pipos \n"+
        "\tMVI     a,2Dh ;- \n"+
        "\tCALL serout\n"+
        "\tCALL    f_abs \n"+
        "pipos:\tCALL  s_div10 \n"+
        "\tPUSH    psw \n"+
        "\tMOV     a,h \n"+
        "\tORA     l \n"+
        "\tJZ      pilast \n"+
        "\tCALL    pipos \n"+
        "pilast:\tPOP     psw \n"+
        "\tADI 30h\n"+  
        "\tCALL serout\n"+  
        "\tRET\n"
    },
    "prtchan": {
        uses:null,
        sysdb:["prtchan"],
        code: "\tMOV A,L\n"+
        "\tSTA sv_prtchan\n"+
        "\tRET\n"
    },
    "println": {
        uses:["serout"],
        code: "\tMVI A,0Dh\n"+
        "\tCALL SEROUT\n"+
        "\tMVI A,0Ah\n"+
        "\tCALL SEROUT\n"+
        "\tRET\n"
    },
    "printtab": {
        uses:["serout"],
        code: "\tMVI A,20h\n"+
        "\tCALL SEROUT\n"+
        "\tMVI A,09h\n"+
        "\tCALL SEROUT\n"+
        "\tRET\n"
    },
    //SYSTEM
    "serout": {
        uses:null,
        sysdb:["prtchan"],
        code: ""+
        "\tRST 1\n"+
        "\tRET\n"
    },

    "s_div10": {
        uses:null,
        code: ""+
        "\tmvi c,10\n"+

        "\tmvi b,16\n"+
        "\txra a\n"+
        "s_d10_1:dad h\n"+
        "\tral\n"+
        "\tcmp c\n"+
        "\tjc s_d10_2\n"+
        "\tinr l\n"+
        "\tsub c\n"+
        "s_d10_2: dcr b\n"+

        "\tjnz s_d10_1\n"+     
        "\tRET\n"
    },  

    //operators
    "o_logic": {
        uses:null,
        code: "olofix: LXI B,8000h\n\tDAD B\n\tXCHG\n\tDAD B\n\tXCHG\n\tRET\n"+
        "dofalse: LXI H,0\n\tRET\n"+
        "dotrue: LXI H,1\n"+
        "\tRET\n"
    },    
    "o_lt": {
        uses:["o_logic"],
        code: "\tCALL olofix\n"+
        "\tMOV A,H\n"+
        "\tCMP D\n"+
        "\tJC dofalse\n"+
        "\tJNZ dotrue\n"+
        "\tMOV A,L\n"+
        "\tCMP E\n"+
        "\tJZ dofalse\n"+
        "\tJC dofalse\n"+
        "\tJMP dotrue\n"
    },
    "o_ge": {
        uses:["o_logic"],
        code: "\tCALL olofix\n"+
        "\tMOV A,H\n"+
        "\tCMP D\n"+
        "\tJC dotrue\n"+
        "\tJNZ dofalse\n"+
        "\tMOV A,L\n"+
        "\tCMP E\n"+
        "\tJZ dotrue\n"+
        "\tJC dotrue\n"+
        "\tJMP dofalse\n"
    },
    "o_gt": {
        uses:["o_logic"],
        code: "\tCALL olofix\n"+
        "\tMOV A,D\n"+
        "\tCMP H\n"+
        "\tJC dofalse\n"+
        "\tJNZ dotrue\n"+
        "\tMOV A,E\n"+
        "\tCMP D\n"+
        "\tJZ dofalse\n"+
        "\tJC dofalse\n"+
        "\tJMP dotrue\n"
    },
    "o_le": {
        uses:["o_logic"],
        code: "\tCALL olofix\n"+
        "\tMOV A,D\n"+
        "\tCMP H\n"+
        "\tJC dotrue\n"+
        "\tJNZ dofalse\n"+
        "\tMOV A,E\n"+
        "\tCMP D\n"+
        "\tJZ dotrue\n"+
        "\tJC dotrue\n"+
        "\tJMP dofalse\n"
    },
    "o_eq": {
        uses:["o_logic"],
        code: "\tMOV A,L\n"+
        "\tCMP E\n"+
        "\tJNZ dofalse\n"+
        "\tMOV A,H\n"+
        "\tCMP D\n"+
        "\tJNZ dofalse\n"+
        "\tJMP dotrue\n"
    },
    "o_neq": {
        uses:["o_logic"],
        code: "\tMOV A,L\n"+
        "\tCMP E\n"+
        "\tJNZ dotrue\n"+
        "\tMOV A,H\n"+
        "\tCMP D\n"+
        "\tJNZ dotrue\n"+
        "\tJMP dofalse\n"
    },

    "o_add": {
        uses:null,
        inline:true,
        code: "\tDAD D\t;o_add\n"+
        ""+
        ""
    },
    "o_mul": {
        uses:null,
        code: ""+
        ""+
        "\tRET\n"
    },
    "o_sub": {
        uses:null,
        inline:true,
        code: ""+
        "\tMOV A, E\n"+
        "\tSUB L\n"+
        "\tMOV L, A\n"+
        "\tMOV A, D\n"+
        "\tSBB H\n"+
        "\tMOV H, A\n"
    },

    "o_div": {
        uses:null,
        code: ""+
        ""+
        "\tRET\n"
    },
    "o_concat": {
        uses:null,
        code: ""+
        ""+
        "\tRET\n"
    },

    //functions
    "f_max": {
        uses:null,
        code: ""+
        ""+
        "\tRET\n"
    },
    "f_abs": {
        uses:null,
        code: "\tMOV A,H\n"+
        "\tORA A\n"+
        "\tRP\n"+
        "\tCMA\n"+
        "\tMOV H,A\n"+
        "\tMOV A,L\n"+
        "\tCMA\n"+
        "\tMOV L,A\n"+
        "\tINX H\n"+
        "\tRET\n"
    },
    "f_neg": {
        uses:null,
        code: "\tMOV A,H\n"+
        "\tCMA\n"+
        "\tMOV H,A\n"+
        "\tMOV A,L\n"+
        "\tCMA\n"+
        "\tMOV L,A\n"+
        "\tINX H\n"+
        "\tRET\n"
    },    
    "f_sgn": {
        uses:null,
        code: "\tMOV A,H\n"+
        "\tRLCA\n"+
        "\tJC f_sgn_m\n"+
        "\tLXI H,1\n"+
        "\tRET\n"+
        "f_sgn_m: LXI H,0FFFFh\n"+
        "\tRET\n"
    },
    "f_rnd": {
        uses:null,
        sysdw:["rndseed"],
        code: ""+
        ""+
        "\tRET\n"
    },    
    "s_getaddr":{
        uses:null,
        code: "\tDAD D\t;o_add\n"+
        "\tMOV E,M\n"+
        "\tINX H\n"+
        "\tMOV D,M\n"+
        "\tXCHG\n"+
        "\tRET\n"
    },
    "f_len": {
        uses:["s_getaddr"],
        code: ""+
        //"\tCALL s_getaddr\n"+
        "\tLXI D,0\n"+
        "f_ll:MOV A,M\n"+
        "\tORA A\n"+
        "\tJZ f_le\n"+
        "\tINX D\n"+
        "\tINX H\n"+
        "\tJMP f_ll\n"+
        "f_le:\tXCHG\n"+
        "\tRET\n"
    },        
    "f_chrS": {
        uses:null,
        sysdw:["chrS"],
        code: "\tMOV A,L\n"+
        "\tSTA sv_chrS\n"+
        "\tXRA A\n"+
        "\tSTA sv_chrS+1\n"+
        "\tLXI H,sv_chrS\n"+
        "\tRET\n"
    },      
}