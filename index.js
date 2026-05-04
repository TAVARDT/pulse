#!/usr/bin/env node
// ----------------------------------------------------------------------
// TAVARDT Pulse: Lightweight Service Monitor
// ----------------------------------------------------------------------
// Description: Monitors HTTP status and sends alerts to Discord/Slack.
// ----------------------------------------------------------------------

'use strict';

const { Command } = require('commander');
const axios = require('axios');

const program = new Command();

program
  .name('tavardt-pulse')
  .description('Elite lightweight monitoring and alerting tool by TAVARDT Agency.')
  .version('1.0.0');

program
  .command('monitor')
  .description('Check a service URL and send an alert if it is down.')
  .requiredOption('-u, --url <type>', 'The service URL to monitor')
  .option('-w, --webhook <type>', 'The Discord or Slack webhook URL for alerts')
  .action(async (options) => {
    const { url, webhook } = options;
    console.log(`[PULSE] Checking status for: ${url}`);

    try {
      const response = await axios.get(url, { timeout: 10000 });
      if (response.status === 200) {
        console.log(`✅ [OK] Service is online: ${url} (HTTP 200)`);
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }
    } catch (error) {
      const errorMessage = error.message;
      console.error(`🚨 [DOWN] Service failure at: ${url}`);
      console.error(`Reason: ${errorMessage}`);

      if (webhook) {
        console.log('[PULSE] Sending alert to webhook...');
        try {
          await axios.post(webhook, {
            content: `🚨 **TAVARDT Pulse Alert**\n\n**Service Down:** ${url}\n**Error:** ${errorMessage}\n**Time:** ${new Date().toISOString()}`
          });
          console.log('✅ Alert sent successfully.');
        } catch (webhookError) {
          console.error(`❌ Failed to send alert: ${webhookError.message}`);
        }
      }
    }
  });

program.parse(process.argv);
