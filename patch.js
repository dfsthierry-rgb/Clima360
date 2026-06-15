import fs from 'fs';

let content = fs.readFileSync('src/pages/PersonaMesh.tsx', 'utf8');

const regex = /<div className="flex items-center gap-3">[\s\S]*?(?=<\/div>\s*<\/div>\s*\}\)\})/m;

content = content.replace(regex, `<div className="flex items-center gap-3">
                    <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <span className="text-xs text-rose-300 font-bold">{p.female?.pct || 0}% F</span>
                      <span className="text-xs text-slate-600">|</span>
                      <span className="text-xs text-blue-300 font-bold">{p.male?.pct || 0}% M</span>
                    </div>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GenderPersonaCard data={p.female} isFemale={true} />
                  <GenderPersonaCard data={p.male} isFemale={false} />
                </div>
              `);

fs.writeFileSync('src/pages/PersonaMesh.tsx', content);
console.log("Done");
