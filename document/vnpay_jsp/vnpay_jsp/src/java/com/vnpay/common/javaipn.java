package com.vnpay.common;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

public class javaipn {
    public static void main(String[] args) {
         try
        {
                        
        /*  IPN URL: Record payment results from VNPAY
        Implementation steps:
        Check checksum
        Find transactions (vnp_TxnRef) in the database (checkOrderId)
        Check the payment status of transactions before updating (checkOrderStatus)
        Check the amount (vnp_Amount) of transactions before updating (checkAmount)
        Update results to Database
        Return recorded results to VNPAY
        IPN URL: Ghi lại kết quả thanh toán từ VNPAY
Các bước thực hiện:
Kiểm tra tổng kiểm tra
Tìm giao dịch (vnp_TxnRef) trong cơ sở dữ liệu (checkOrderId)
Kiểm tra trạng thái thanh toán của giao dịch trước khi cập nhật (checkOrderStatus)
Kiểm tra số tiền (vnp_Amount) của giao dịch trước khi cập nhật (checkAmount)
Cập nhật kết quả vào Cơ sở dữ liệu
Trả kết quả đã ghi lại về VNPAY
        */
                
            // ex:  	PaymnentStatus = 0; pending 
            //              PaymnentStatus = 1; success 
            //              PaymnentStatus = 2; Faile 
            
            //Begin process return from VNPAY\
            //Bắt đầu quá trình trả về từ VNPAY
            Map fields = new HashMap();
             for (Enumeration params = request.getParameterNames(); params.hasMoreElements();) {
                String fieldName = URLEncoder.encode((String) params.nextElement(), StandardCharsets.US_ASCII.toString());
                String fieldValue = URLEncoder.encode(request.getParameter(fieldName), StandardCharsets.US_ASCII.toString());
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }
    
            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType")) 
            {
                fields.remove("vnp_SecureHashType");
            }
            if (fields.containsKey("vnp_SecureHash")) 
            {
                fields.remove("vnp_SecureHash");
            }
            
            // Check checksum
            String signValue = Config.hashAllFields(fields);
            if (signValue.equals(vnp_SecureHash)) 
            {
    
                boolean checkOrderId = true; // vnp_TxnRef exists in your database
                boolean checkAmount = true; // vnp_Amount is valid (Check vnp_Amount VNPAY returns compared to the 
                amount of the code (vnp_TxnRef) in the Your database).
                boolean checkOrderStatus = true; // PaymnentStatus = 0 (pending)
                
                
                if(checkOrderId)
                {
                    if(checkAmount)
                    {
                        if (checkOrderStatus)
                        {
                            if ("00".equals(request.getParameter("vnp_ResponseCode")))
                            {
                                
                                //Here Code update PaymnentStatus = 1 into your Database
                            }
                            else
                            {
                                
                                // Here Code update PaymnentStatus = 2 into your Database
                            }
                            out.print ("{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}");
                        }
                        else
                        {
                            
                            out.print("{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}");
                        }
                    }
                    else
                    {
                       out.print("{\"RspCode\":\"04\",\"Message\":\"Invalid Amount\"}"); 
                    }
                }
                else
                {
                    out.print("{\"RspCode\":\"01\",\"Message\":\"Order not Found\"}");
                }
            } 
            else 
            {
                out.print("{\"RspCode\":\"97\",\"Message\":\"Invalid Checksum\"}");
            }
        }
        catch(Exception e)
        {
            out.print("{\"RspCode\":\"99\",\"Message\":\"Unknow error\"}");
        }
    }
}
