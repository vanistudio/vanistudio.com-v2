import { useEffect } from "react"
const ConsoleProvider = () => {
  useEffect(() => {
    console.log("Author: Vani Studio")
    console.log(
      `%c//////////////////////////////////////////////////////////////////////
      Thế gian vốn vô thường, code bug là lẽ tự nhiên  
                          _ooOoo_                               
                         o8888888o                              
                         88" . "88                              
                         (| ^_^ |)                              
                         O\\  =  /O                              
                      ____/\\---'\\____                           
                    .'  \\\\|     |//  \`.                          
                   /  \\\\|||  :  |||//  \\                        
                  /  _||||| -:- |||||-  \\                       
                  |   | \\\\\\  -  /// |   |                       
                  | \\_|  ''\\---/''  |   |                       
                  \\  .-\\__  \`-\`  ___/-. /                       
                ___\`. .'  /--.--\\  \`. . ___                     
              ."" '<  \`.___\\_<|>_/___.'  >'"".                  
            | | :  \`- \\\`.;\`\\ _ /\`;.\`/ - \` : | |                 
            \\  \\ \`-.   \\_ __\\ /__ _/   .-\` /  /                 
      ========\`-.____\`-.___\\_____/___.-\`____.-'========         
                           \`=---='                              
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^        
  Thành tâm cầu Phật gia hộ — code sạch bug, deploy thuận lợi                    
//////////////////////////////////////////////////////////////////////`,
      `
        font-family: monospace;
        font-size: 12px;
        background: linear-gradient(90deg, #22c55e, #3b82f6, #a855f7);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      `
    )

    console.log(
      `%c//////////////////////////////////////////////////////////////////////
      The world is impermanent, bugs are inevitable  
                          _ooOoo_                               
                         o8888888o                              
                         88" . "88                              
                         (| -_- |)                              
                         O\\  =  /O                              
                      ____/\\---'\\____                           
                    .'  \\\\|     |//  \`.                          
                   /  \\\\|||  :  |||//  \\                        
                  /  _||||| -:- |||||-  \\                       
                  |   | \\\\\\  -  /// |   |                       
                  | \\_|  ''\\---/''  |   |                       
                  \\  .-\\__  \`-\`  ___/-. /                       
                ___\`. .'  /--.--\\  \`. . ___                     
              ."" '<  \`.___\\_<|>_/___.'  >'"".                  
            | | :  \`- \\\`.;\`\\ _ /\`;.\`/ - \` : | |                 
            \\  \\ \`-.   \\_ __\\ /__ _/   .-\` /  /                 
      ========\`-.____\`-.___\\_____/___.-\`____.-'========         
                           \`=---='                              
      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^        
   Sincerely praying to the Debug Gods —
   may our code be clean, our build be green,
   and production stay peaceful.                      
//////////////////////////////////////////////////////////////////////`,
      `
        font-family: monospace;
        font-size: 12px;
        background: linear-gradient(90deg, #facc15, #fb923c, #ef4444);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      `
    )
  }, [])

  return null
}

export { ConsoleProvider }
