import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { rejects } from "assert";
import { resolve } from "path";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ExternalAPIService {
  constructor(private readonly httpService: HttpService) {}

  async requestWolfram(prompt: string): Promise<string> {
    if(prompt === '') {
      return "";
    }

    if(process.env.NODE_ENV === "dev"){
      return new Promise((resolve, rejects) => {
        resolve("Das ist nur eine default Antwort um Tokens zu sparen.")
      })
    }

    if(process.env.WOLFRAM_APP_ID == undefined) {
      throw Error("ENV WOLFRAM_APP_ID is undefined")
    }

    const { data } = await firstValueFrom(
      this.httpService.get(process.env.WOLFRAM_APP_ID+encodeURIComponent(prompt)).pipe()
    );
    try{
      let imageBase64 = Buffer.from(data, 'binary').toString('base64');
      return imageBase64;
    }
    catch(error){
      console.log("Unable to convert response to base64\n\n"+error)
      return "";
    }
  }

  async requestGPT(prompt: string): Promise<string> {
    if(prompt === '') {
      return ""
    }

    if(process.env.NODE_ENV === "dev"){
      return new Promise((resolve, rejects) => {
        resolve("Das ist nur eine default Antwort um Tokens zu sparen.")
      })
    }

    let body = {
      "prompt": prompt
    }

    let header = {
      "headers":{
        "Authorization": process.env.GPT_APP_TOKEN
      }
    }

    if(process.env.GPT_APP_URL == undefined){
      throw Error("ENV GPT_APP_URL is undefined");
    }
    const { data } = await firstValueFrom(
      this.httpService.post(process.env.GPT_APP_URL, body, header).pipe()
    );

    if(data.output != null){
      return data.output
    }
    else{
      return ""
    }
  }
}