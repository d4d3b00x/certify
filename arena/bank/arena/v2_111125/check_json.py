import boto3, json, time
from copy import deepcopy

TABLE="arenaQuestions"
MAX_OPT=4

def norm_diff(v):
    v=(v or "").lower()
    return {"easy":"low"}.get(v,v)

def getS(it,k): return it.get(k,{}).get("S")
def setS(it,k,val): it[k]={"S":val}
def ensure_bool(it,k,default=False): 
    if "BOOL" not in it.get(k,{}): it[k]={"BOOL":default}

def fix_item(item):
    it = deepcopy(item)  # it is the raw Item map with S/N/BOOL types
    changed=False

    # difficulty normalize
    d = getS(it,"difficulty")
    nd = norm_diff(d)
    if d!=nd:
        setS(it,"difficulty",nd); changed=True

    # options
    L = it.get("options",{}).get("L",[])
    # normalize structure
    fixed=[]
    for o in L:
        m=o.get("M",{})
        if not m: continue
        oid = m.get("id",{}).get("S","")
        text = m.get("text",{}).get("S","")
        corr = m.get("is_correct",{}).get("BOOL",False)
        fixed.append({"M":{"id":{"S":oid or str(chr(64+len(fixed)+1))},
                           "text":{"S":text or f"Opción {chr(64+len(fixed)+1)}"},
                           "is_correct":{"BOOL":bool(corr)}}})
    # ensure exactly 4
    while len(fixed)<MAX_OPT:
        label = chr(64+len(fixed)+1)
        fixed.append({"M":{"id":{"S":label},
                           "text":{"S":f"Distractor {label}"},
                           "is_correct":{"BOOL":False}}})
    if len(fixed)>MAX_OPT: fixed=fixed[:MAX_OPT]
    # ensure exactly one correct
    if sum(1 for o in fixed if o["M"]["is_correct"]["BOOL"])!=1:
        # make only first correct
        for i,o in enumerate(fixed):
            o["M"]["is_correct"]["BOOL"] = (i==0)
        changed=True
    if it.get("options",{}).get("L",[]) != fixed:
        it["options"]={"L":fixed}; changed=True

    # active must exist
    ensure_bool(it,"active",True)

    # mark title
    t = getS(it,"title") or ""
    if changed and "[FIXED]" not in t:
        setS(it,"title", (t+" [FIXED]").strip())
    return changed, it

def main():
    ddb=boto3.client("dynamodb")
    paginator=ddb.get_paginator("scan")
    problems=0
    fixes=[]
    for page in paginator.paginate(TableName=TABLE):
        for it in page.get("Items",[]):
            changed, newit = fix_item(it)
            # detect structural problems in original
            L = it.get("options",{}).get("L",[])
            correct = sum(1 for o in L if o.get("M",{}).get("is_correct",{}).get("BOOL") is True)
            if (not isinstance(L,list)) or len(L)!=4 or correct!=1:
                problems+=1
                fixes.append({"PutRequest":{"Item": newit}})

    print(f"Detectados {problems} items con problemas.")
    if not fixes:
        print("No hay nada que corregir.")
        return

    out=f"arena_fixes_{int(time.time())}.json"
    with open(out,"w",encoding="utf-8") as f:
        json.dump({"arenaQuestions": fixes}, f, ensure_ascii=False, indent=2)
    print(f"Escrito fichero de corrección: {out}")
    print("\nImporta así (ajusta región si aplica):")
    print(f"aws dynamodb batch-write-item --request-items file://{out}")

if __name__=="__main__":
    main()
